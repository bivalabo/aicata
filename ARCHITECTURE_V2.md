# Aicata DDP v2: インクリメンタルビルドアーキテクチャ

## 問題点（v1）

1. 4ステージが1つのAPIリクエスト内で同期実行（~120秒）
2. 結果をSSEで一括送信するためクライアントタイムアウト超過
3. 途中で切れると全作業が失われる
4. 再試行時にまた全ステージが最初から実行される（コスト2倍）

## 解決策（v2）: ステップバイステップ・ビルド

### 核心原則

- **1 APIリクエスト = 1つの小さなタスク**（各15-30秒以内）
- **各ステップの結果をDBに保存**（途中で切れても再開可能）
- **クライアントが各ステップを順次呼び出し**（サーバーは状態を持たない）
- **セクション単位で結果を即座に表示**（ユーザーが進捗を実感）

### ビルドフロー

```
Step 0: サイト分析（既存：crawl + analyze）
         ↓ 保存: サイト構造、ページリスト

Step 1: デザイン設計（Stage 1）
         1回のAPI call、~20秒
         ↓ 保存: DesignSpec（JSON）をDBへ

Step 2-N: セクション個別生成（Stage 2を分割）
         各セクション1回のAPI call、~15秒
         ↓ 保存: 各RenderedSectionをDBへ
         ↓ 即座にプレビューに追加表示

Step N+1: ページ組み立て（Stage 3）
         AIなし、<1秒
         ↓ 保存: AssembledPageをDBへ
         ↓ プレビューに完成ページ表示

Step N+2: 品質レビュー（Stage 4、オプション）
         1回のAPI call、~15秒
         ↓ 保存: ReviewResultをDBへ
```

### 新APIエンドポイント

```
POST /api/build/plan
  入力: { url, pageType, userInstructions }
  出力: { buildId, designSpec, sections: [{id, purpose}...] }
  時間: ~20秒

POST /api/build/section
  入力: { buildId, sectionId }
  出力: { sectionId, html, css, status }
  時間: ~15秒

POST /api/build/assemble
  入力: { buildId }
  出力: { fullDocument, validation }
  時間: <1秒

POST /api/build/review  (オプション)
  入力: { buildId }
  出力: { scores, suggestions }
  時間: ~15秒
```

### DBスキーマ（新規テーブル）

```sql
-- ビルドジョブの状態管理
CREATE TABLE build_job (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversation(id),
  page_type TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
    -- 'planning' | 'building' | 'assembling' | 'reviewing' | 'complete' | 'failed'
  design_spec JSONB,          -- Stage 1の結果
  assembled_html TEXT,         -- Stage 3の結果
  assembled_css TEXT,
  review_result JSONB,         -- Stage 4の結果
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 各セクションの生成状態
CREATE TABLE build_section (
  id TEXT PRIMARY KEY,
  build_id TEXT REFERENCES build_job(id),
  section_id TEXT NOT NULL,    -- "hero", "features" など
  spec JSONB NOT NULL,         -- SectionSpecのJSON
  html TEXT,                   -- 生成されたHTML
  css TEXT,                    -- 生成されたCSS
  status TEXT NOT NULL DEFAULT 'pending',
    -- 'pending' | 'generating' | 'complete' | 'failed'
  retry_count INTEGER DEFAULT 0,
  error TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### クライアント側フロー

```typescript
// BuildController.tsx（新コンポーネント）
async function runBuild(url: string) {
  // Step 1: 設計
  setStep('planning');
  const { buildId, designSpec, sections } = await api.post('/api/build/plan', { url });
  setSections(sections.map(s => ({ ...s, status: 'pending' })));

  // Step 2-N: セクション個別生成
  setStep('building');
  for (const section of sections) {
    setSectionStatus(section.id, 'generating');
    try {
      const result = await api.post('/api/build/section', { buildId, sectionId: section.id });
      setSectionStatus(section.id, 'complete');
      addToPreview(result.html, result.css);  // 即座にプレビューに追加
    } catch (err) {
      setSectionStatus(section.id, 'failed');
      // 失敗してもスキップして次へ → 後でリトライ可能
    }
  }

  // Step N+1: 組み立て
  setStep('assembling');
  const { fullDocument } = await api.post('/api/build/assemble', { buildId });
  setPreview(fullDocument);  // 完成ページを表示

  // Step N+2: レビュー（オプション）
  setStep('reviewing');
  const review = await api.post('/api/build/review', { buildId });
  setReview(review);

  setStep('complete');
}
```

### メリット

1. **タイムアウトしない**: 各リクエストは15-30秒（十分余裕）
2. **途中再開可能**: DBに保存されるので、ブラウザを閉じても続きから
3. **失敗セクションだけリトライ**: 全やり直し不要（コスト大幅削減）
4. **リアルタイム進捗**: セクションが完成するたびにプレビューに追加
5. **コスト効率**: 無駄な再実行がゼロ

### コスト比較

| シナリオ | v1（現在） | v2（新） |
|---------|-----------|---------|
| 正常完了 | $0.75-0.95 | $0.75-0.95 |
| 1回タイムアウト | $1.50-1.90（全やり直し） | $0.75-0.95（失敗セクションのみ$0.05） |
| 2回タイムアウト | $2.25-2.85 | $0.80-1.00 |
| 10ページサイト | $7.50-9.50（1ページも完成しないリスク）| $7.50-9.50（確実に全完成）|

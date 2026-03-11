/**
 * Aicata 会話テンプレート / スターター
 *
 * ユーザーが「AIに何を言えばいいかわからない」という
 * 心理的ハードルを解消するための会話開始テンプレート集。
 *
 * カテゴリ別に整理され、ワンタップで会話を開始できる。
 */

export interface ConversationTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;  // Polaris icon name
  prompt: string;
  followUpQuestions?: string[];
}

export const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  // ===== ページ新規作成 =====
  {
    id: "new-landing-page",
    category: "PAGE_CREATION",
    title: "新商品のランディングページを作りたい",
    description: "商品の魅力を伝える縦長のLPを作成します",
    icon: "PageAddMajor",
    prompt: "新商品のランディングページを作りたいです。商品の特徴を効果的に伝える、日本のECユーザーに刺さるデザインでお願いします。",
    followUpQuestions: [
      "どんな商品ですか？（カテゴリ、価格帯、ターゲット層）",
      "参考にしたいデザインやイメージはありますか？",
      "特に訴求したいポイントは何ですか？",
    ],
  },
  {
    id: "new-collection-page",
    category: "PAGE_CREATION",
    title: "コレクションページを作りたい",
    description: "商品カテゴリの一覧ページをデザインします",
    icon: "CollectionsMajor",
    prompt: "商品コレクションのページを作りたいです。商品が見やすく、購買意欲を高めるレイアウトでお願いします。",
  },
  {
    id: "new-about-page",
    category: "PAGE_CREATION",
    title: "ブランドストーリーページを作りたい",
    description: "ブランドの世界観を伝えるAboutページを作成します",
    icon: "StoreMajor",
    prompt: "ブランドのストーリーや想いを伝えるAboutページを作りたいです。信頼感と共感を生むデザインでお願いします。",
  },

  // ===== 既存ページ改善 =====
  {
    id: "improve-conversion",
    category: "PAGE_IMPROVEMENT",
    title: "ページのコンバージョンを改善したい",
    description: "既存ページの分析と改善提案を行います",
    icon: "ChartVerticalMajor",
    prompt: "既存のページのコンバージョン率を改善したいです。現在のページを分析して、改善点を教えてください。",
    followUpQuestions: [
      "改善したいページのURLまたはページ名を教えてください",
      "現在のコンバージョン率はどのくらいですか？",
      "目標とするコンバージョン率はありますか？",
    ],
  },
  {
    id: "mobile-optimization",
    category: "PAGE_IMPROVEMENT",
    title: "モバイル表示を最適化したい",
    description: "スマートフォンでの表示と操作性を改善します",
    icon: "MobileMajor",
    prompt: "ストアのモバイル表示を最適化したいです。スマートフォンユーザーの体験を向上させる改善を提案してください。",
  },
  {
    id: "speed-optimization",
    category: "PAGE_IMPROVEMENT",
    title: "ページの読み込みを速くしたい",
    description: "Core Web Vitalsとパフォーマンスを改善します",
    icon: "ClockMajor",
    prompt: "ストアのページ読み込み速度を改善したいです。Core Web Vitalsのスコアを上げるための具体的な施策を教えてください。",
  },

  // ===== SEO =====
  {
    id: "seo-audit",
    category: "SEO",
    title: "SEOの状態をチェックしたい",
    description: "ストア全体のSEO診断と改善提案を行います",
    icon: "SearchMajor",
    prompt: "ストアのSEO状態を診断してください。メタデータ、構造化データ、内部リンクなど、改善すべきポイントを優先度付きで教えてください。",
  },
  {
    id: "seo-product-description",
    category: "SEO",
    title: "商品説明をSEO最適化したい",
    description: "検索に強い商品説明文を作成します",
    icon: "ProductsMajor",
    prompt: "商品説明文をSEOに強い形に書き直したいです。検索意図を意識しつつ、購買意欲も高める説明文を作成してください。",
  },

  // ===== キャンペーン・セール =====
  {
    id: "sale-page",
    category: "CAMPAIGN",
    title: "セールページを準備したい",
    description: "期間限定セール用のページを作成します",
    icon: "DiscountsMajor",
    prompt: "期間限定のセールページを作りたいです。カウントダウンタイマーや、緊急感を演出するデザインでお願いします。",
    followUpQuestions: [
      "セールの期間はいつからいつまでですか？",
      "割引率や特典の内容を教えてください",
      "対象商品は全商品ですか、特定のカテゴリですか？",
    ],
  },
  {
    id: "seasonal-page",
    category: "CAMPAIGN",
    title: "季節のキャンペーンページを作りたい",
    description: "季節イベントに合わせたページを作成します",
    icon: "CalendarMajor",
    prompt: "季節のキャンペーンページを作りたいです。今の時期に合った、日本の消費者に響くデザインで提案してください。",
  },

  // ===== 分析 =====
  {
    id: "store-health-check",
    category: "ANALYSIS",
    title: "ストアの健康診断をしたい",
    description: "ストア全体の状態を総合的に診断します",
    icon: "ReportMajor",
    prompt: "ストア全体の健康診断をお願いします。デザイン、SEO、パフォーマンス、ユーザビリティの観点から評価して、改善の優先順位を教えてください。",
  },
  {
    id: "competitor-design-analysis",
    category: "ANALYSIS",
    title: "競合のデザインを参考にしたい",
    description: "競合ストアのデザイン分析と提案を行います",
    icon: "ViewMajor",
    prompt: "競合他社のShopifyストアのデザインを参考にしたいです。良いところを取り入れつつ、オリジナリティのあるデザインを提案してください。",
  },

  // ===== 一般 =====
  {
    id: "free-chat",
    category: "GENERAL",
    title: "自由に相談したい",
    description: "何でもお気軽にどうぞ。最適な提案をします",
    icon: "ChatMajor",
    prompt: "",  // 空 = ユーザーが自由に入力
  },
];

/**
 * カテゴリ別にテンプレートを取得
 */
export function getTemplatesByCategory(): Record<string, ConversationTemplate[]> {
  const grouped: Record<string, ConversationTemplate[]> = {};

  for (const template of CONVERSATION_TEMPLATES) {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  }

  return grouped;
}

/**
 * カテゴリの日本語ラベル
 */
export const CATEGORY_LABELS: Record<string, string> = {
  PAGE_CREATION: "ページを作る",
  PAGE_IMPROVEMENT: "ページを改善する",
  SEO: "SEO対策",
  CAMPAIGN: "キャンペーン・セール",
  ANALYSIS: "分析・診断",
  GENERAL: "その他",
};

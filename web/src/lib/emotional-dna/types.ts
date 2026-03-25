// ============================================================
// Emotional DNA — 感情の地層
// Brand Memoryの最深層：オーナーのワクワクドキドキを記憶する
// ============================================================

/**
 * EmotionalDNA — オーナーの感情・思想・原体験から導出されたブランドの魂
 *
 * 色やフォントは「結果」。EmotionalDNAは「源泉」。
 * ヒアリング対話を通じてオーナーの感情の地層を掬い上げ、
 * デザイン生成時にAIが「共鳴」できるコンテキストを提供する。
 */
export interface EmotionalDNA {
  // ── オーナーの原点 ──

  /** なぜこのビジネスを始めたのか（原体験・きっかけ） */
  originStory: string;

  /** 根底にある感情（例："誰かの日常に小さな驚きを届けたい"） */
  coreEmotion: string;

  // ── 顧客への願い ──

  /** サイト訪問の最初の3秒で感じてほしいこと */
  firstImpression: string;

  /** 商品を受け取った後、心に残ってほしい感覚 */
  afterFeeling: string;

  /** お客さんにどんな表情になってほしいか */
  customerFace: string;

  // ── 空気感 ──

  /** 目指す空気感キーワード（例：["温かい朝の光", "手触りのある質感", "静かな自信"]） */
  atmosphere: string[];

  /** こうはなりたくない空気感（例：["冷たい", "急かされる", "量産品感"]） */
  antiAtmosphere: string[];

  // ── 感情から導出されたデザイン方向 ──

  /** atmosphereからAIが導いたデザイントーン */
  derivedTones: string[];

  /** 色の方向性（例："暖色の柔らかさ"、"深い信頼の青"） */
  derivedColorMood: string;

  /** 文字の方向性（例："手書きの温もり"、"端正な知性"） */
  derivedTypographyFeel: string;

  /** ブランドの世界を一言で表すフレーズ（AIが生成） */
  essencePhrase: string;
}

/**
 * ヒアリング対話の1ターン
 */
export interface HearingTurn {
  /** Aicataからの問いかけ */
  question: string;
  /** オーナーの回答 */
  answer: string;
}

/**
 * ヒアリングセッション全体
 */
export interface HearingSession {
  /** 対話ターンの履歴 */
  turns: HearingTurn[];
  /** ヒアリングから抽出されたEmotionalDNA */
  emotionalDna: EmotionalDNA | null;
  /** セッションの状態 */
  status: "in_progress" | "completed";
  /** 完了日時 */
  completedAt?: string;
}

/**
 * ヒアリングAPI レスポンス
 */
export interface HearingResponse {
  /** 次の問いかけ（nullならヒアリング完了） */
  nextQuestion: string | null;
  /** 共感コメント（前の回答に対するAicataの反応） */
  empathyComment: string;
  /** ヒアリング完了時のEmotionalDNA */
  emotionalDna?: EmotionalDNA;
  /** 完了フラグ */
  isComplete: boolean;
  /** 現在の問いかけ番号 */
  currentStep: number;
  /** 全体の問いかけ数（目安） */
  totalSteps: number;
}

// ============================================================
// Emotional DNA — Hearing Engine
// 感情ヒアリング対話エンジン
//
// 「色は何色がいいですか？」ではなく
// 「あなたのお客さんにどんな顔になってほしいですか？」と問いかける。
// 感情の地層を掬い上げ、そこからデザインの方向性を自然に導出する。
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type { EmotionalDNA, HearingTurn } from "./types";

// ============================================================
// System Prompt — ヒアリング対話のペルソナ
// ============================================================

const HEARING_SYSTEM_PROMPT = `あなたは「Aicata」というAI搭載ECサイトビルダーのAIパートナーです。
今からオーナーさんの「感情の地層」を掬い上げるためのヒアリングを行います。

## あなたの役割
あなたは優秀なブランドストラテジスト兼カウンセラーです。
オーナーさんの心の中にある「ワクワクドキドキ」を引き出すために、
温かく、興味を持って、共感しながら対話を進めてください。

## 重要な原則
1. **色やフォントを直接聞かない** — それは結果であって源泉ではない
2. **感情を聞く** — なぜ始めたのか、お客さんにどう感じてほしいのか、どんな空気感が心地よいのか
3. **共感してから次の問いへ** — 相手の言葉を受け止めて、深掘りしたくなったら深掘りする
4. **押し付けない** — 選択肢を並べるのではなく、自由に語ってもらう
5. **機械的にならない** — フォームの質問を順番に読むのではなく、会話として自然に進める
6. **短く温かく** — 長文で圧倒しない。相手が話しやすい空気を作る

## ヒアリングで掬い上げたい情報（7つの問いかけの方向性）
以下はガイドラインであり、固定の順番ではありません。会話の流れに応じて自然に問いかけてください。

1. **原点** — このビジネスを始めたきっかけ、その時の気持ち
2. **核となる感情** — 一番大事にしている想い、ビジネスの根っこにある感情
3. **第一印象** — サイトに来た人に最初の3秒で感じてほしいこと
4. **アフターフィーリング** — 商品を受け取った人に残ってほしい感覚、なってほしい表情
5. **空気感** — ブランドが持つべき空気感（比喩OK：「秋の公園みたいな」等）
6. **アンチ空気感** — こうはなりたくない、避けたい雰囲気
7. **エッセンス** — ブランドを一言で表すなら？

## 出力形式
必ず以下のJSON形式で出力してください。マークダウンのコードブロックは使わないでください。

対話中：
{"empathyComment": "共感コメント", "nextQuestion": "次の問いかけ", "isComplete": false}

ヒアリング完了時（十分な情報が集まったと判断したら）：
{"empathyComment": "最後の共感コメント", "nextQuestion": null, "isComplete": true, "emotionalDna": {"originStory": "...", "coreEmotion": "...", "firstImpression": "...", "afterFeeling": "...", "customerFace": "...", "atmosphere": ["...", "..."], "antiAtmosphere": ["...", "..."], "derivedTones": ["...", "..."], "derivedColorMood": "...", "derivedTypographyFeel": "...", "essencePhrase": "..."}}

## 補足
- 5〜7回の対話で完了を目指してください（長すぎると疲れる）
- オーナーの言葉をそのまま大切にしてください（言い換えすぎない）
- derivedTones, derivedColorMood, derivedTypographyFeel はオーナーの感情から自然に導出してください
- essencePhrase はオーナーのブランドの魂を凝縮した一言です（キャッチコピーではなく、内なるフレーズ）
`;

// ============================================================
// Hearing Engine Core
// ============================================================

/**
 * ヒアリング対話の最初の問いかけを生成
 */
export function getInitialQuestion(): string {
  return "はじめまして。あなたのブランドの「らしさ」を一緒に見つけていきたいと思います。まず聞かせてください — このビジネスを始めようと思ったきっかけは何でしたか？その時、どんな気持ちでしたか？";
}

/**
 * ヒアリング対話を1ターン進める
 */
export async function advanceHearing(
  turns: HearingTurn[],
  latestAnswer: string,
): Promise<{
  empathyComment: string;
  nextQuestion: string | null;
  isComplete: boolean;
  emotionalDna?: EmotionalDNA;
}> {
  const anthropic = new Anthropic();

  // 対話履歴をメッセージ配列に変換
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const turn of turns) {
    messages.push({
      role: "assistant",
      content: JSON.stringify({
        empathyComment: "",
        nextQuestion: turn.question,
        isComplete: false,
      }),
    });
    messages.push({
      role: "user",
      content: turn.answer,
    });
  }

  // 最新の回答を追加
  messages.push({
    role: "user",
    content: latestAnswer,
  });

  // 対話履歴が空の場合（初回）、最初の問いかけをassistantメッセージとして追加
  if (turns.length === 0) {
    messages.unshift({
      role: "assistant",
      content: JSON.stringify({
        empathyComment: "",
        nextQuestion: getInitialQuestion(),
        isComplete: false,
      }),
    });
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: HEARING_SYSTEM_PROMPT,
    messages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // JSONを抽出（余分なテキストがある場合に備える）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      empathyComment: parsed.empathyComment || "",
      nextQuestion: parsed.nextQuestion || null,
      isComplete: parsed.isComplete || false,
      emotionalDna: parsed.emotionalDna || undefined,
    };
  } catch {
    // パース失敗 — テキストをそのまま共感コメントとして返す
    return {
      empathyComment: text,
      nextQuestion:
        "すみません、もう少し聞かせてください。あなたのブランドで一番大切にしていることは何ですか？",
      isComplete: false,
    };
  }
}

/**
 * EmotionalDNA を DDP 注入用のプロンプトテキストに変換
 */
export function emotionalDnaToPromptContext(dna: EmotionalDNA): string {
  const lines: string[] = [
    `## ブランドの感情の地層（Emotional DNA）`,
    ``,
    `このストアのオーナーは以下の想いでビジネスを営んでいます。`,
    `デザインはこの想いから自然に立ち上がるものにしてください。`,
    ``,
    `### オーナーの原点`,
    dna.originStory,
    ``,
    `### 根底にある感情`,
    dna.coreEmotion,
    ``,
    `### お客さんへの願い`,
    `- 最初の3秒で感じてほしいこと: ${dna.firstImpression}`,
    `- 商品を受け取った後に残ってほしい感覚: ${dna.afterFeeling}`,
    `- お客さんになってほしい表情: ${dna.customerFace}`,
    ``,
    `### 目指す空気感`,
    dna.atmosphere.map((a) => `- ${a}`).join("\n"),
    ``,
    `### 避けたい空気感`,
    dna.antiAtmosphere.map((a) => `- ${a}`).join("\n"),
    ``,
    `### デザインの方向性（感情から導出）`,
    `- トーン: ${dna.derivedTones.join("、")}`,
    `- 色の方向性: ${dna.derivedColorMood}`,
    `- タイポグラフィの方向性: ${dna.derivedTypographyFeel}`,
    ``,
    `### ブランドのエッセンス`,
    `「${dna.essencePhrase}」`,
  ];

  return lines.join("\n");
}

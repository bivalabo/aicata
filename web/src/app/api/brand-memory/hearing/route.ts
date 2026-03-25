// ============================================================
// Emotional DNA Hearing API
// 感情ヒアリング対話エンドポイント
//
// POST /api/brand-memory/hearing — ヒアリング対話を1ターン進める
// GET  /api/brand-memory/hearing — 現在のヒアリング状態を取得
// DELETE /api/brand-memory/hearing — ヒアリングをリセット
// ============================================================

import { prisma } from "@/lib/db";
import { apiErrorResponse } from "@/lib/api-error";
import {
  getInitialQuestion,
  advanceHearing,
} from "@/lib/emotional-dna/hearing-engine";
import type { HearingSession, HearingTurn } from "@/lib/emotional-dna/types";

export const maxDuration = 60; // AI呼び出しがあるため長めに

// ── Helper ──

function safeParseJson<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

async function getOrCreateDefaultStore() {
  let store = await prisma.store.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!store) {
    store = await prisma.store.create({
      data: {
        shop: "default.myshopify.com",
        accessToken: "",
        name: "My Store",
        isActive: true,
      },
    });
  }
  return store;
}

// ── GET: ヒアリング状態の取得 ──

export async function GET() {
  try {
    const store = await getOrCreateDefaultStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandMemoryModel = (prisma as any).brandMemory;
    if (!brandMemoryModel) {
      return Response.json({ error: "Brand Memoryモデルが利用できません" }, { status: 500 });
    }

    const memory = await brandMemoryModel.findUnique({
      where: { storeId: store.id },
    });

    if (!memory) {
      // Brand Memoryがまだない → ヒアリング未開始
      return Response.json({
        status: "none",
        turns: [],
        emotionalDna: null,
        initialQuestion: getInitialQuestion(),
      });
    }

    const hearingSession = safeParseJson<HearingSession | null>(
      memory.hearingSession,
      null,
    );
    const emotionalDna = safeParseJson(memory.emotionalDna, null);

    return Response.json({
      status: memory.hearingStatus || "none",
      turns: hearingSession?.turns || [],
      emotionalDna,
      initialQuestion: getInitialQuestion(),
    });
  } catch (error) {
    return apiErrorResponse(error, "Hearing GET");
  }
}

// ── POST: ヒアリング対話を1ターン進める ──

export async function POST(request: Request) {
  try {
    const { answer } = await request.json();

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return Response.json(
        { error: "回答を入力してください" },
        { status: 400 },
      );
    }

    const store = await getOrCreateDefaultStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandMemoryModel = (prisma as any).brandMemory;
    if (!brandMemoryModel) {
      return Response.json(
        { error: "Brand Memoryモデルが利用できません" },
        { status: 500 },
      );
    }

    // 既存のBrand Memoryを取得（なければ作成）
    let memory = await brandMemoryModel.findUnique({
      where: { storeId: store.id },
    });

    if (!memory) {
      memory = await brandMemoryModel.create({
        data: {
          storeId: store.id,
          hearingStatus: "in_progress",
        },
      });
    }

    // 現在のヒアリング履歴
    const session = safeParseJson<HearingSession>(memory.hearingSession, {
      turns: [],
      emotionalDna: null,
      status: "in_progress",
    });

    // AI対話エンジンを呼び出し
    const result = await advanceHearing(session.turns, answer.trim());

    // 最新のターンを追加（直前の質問 + 今回の回答）
    const currentQuestion =
      session.turns.length === 0
        ? getInitialQuestion()
        : session.turns[session.turns.length - 1]
          ? result.empathyComment // これはフォールバック、通常は前のnextQuestionを使う
          : getInitialQuestion();

    // 直前の問いかけを特定
    const lastQuestion =
      session.turns.length > 0
        ? // 前のターンのnextQuestion相当（session.turnsの最後の要素のquestion）
          session.turns[session.turns.length - 1].question
        : getInitialQuestion();

    // ただし初回の場合は別処理
    const questionForThisTurn =
      session.turns.length === 0 ? getInitialQuestion() : lastQuestion;

    // ... 実際にはもっとシンプルに。turnsが空なら初回質問、そうでなければ前回のnextQuestionを記録
    const newTurn: HearingTurn = {
      question:
        session.turns.length === 0
          ? getInitialQuestion()
          : // 前回のレスポンスで返したnextQuestionを使うべきだが、
            // セッションに保存されていないので、直近のturnsの末尾からは推定できない
            // → セッションに pendingQuestion を保存する仕組みに変更
            (session as any).pendingQuestion || "（前回の問いかけ）",
      answer: answer.trim(),
    };

    const updatedTurns = [...session.turns, newTurn];

    // セッション更新
    const updatedSession: HearingSession & { pendingQuestion?: string } = {
      turns: updatedTurns,
      emotionalDna: result.emotionalDna || null,
      status: result.isComplete ? "completed" : "in_progress",
      ...(result.isComplete ? { completedAt: new Date().toISOString() } : {}),
      // 次の問いかけを保存しておく
      pendingQuestion: result.nextQuestion || undefined,
    };

    // DB更新
    const updateData: Record<string, string | Date> = {
      hearingSession: JSON.stringify(updatedSession),
      hearingStatus: result.isComplete ? "completed" : "in_progress",
    };

    // EmotionalDNAが完成した場合は保存
    if (result.isComplete && result.emotionalDna) {
      updateData.emotionalDna = JSON.stringify(result.emotionalDna);

      // EmotionalDNAの導出トーンをBrand Memoryのtonesにも反映
      if (result.emotionalDna.derivedTones?.length > 0) {
        updateData.tones = JSON.stringify(result.emotionalDna.derivedTones);
      }
    }

    await brandMemoryModel.update({
      where: { storeId: store.id },
      data: updateData,
    });

    return Response.json({
      empathyComment: result.empathyComment,
      nextQuestion: result.nextQuestion,
      isComplete: result.isComplete,
      emotionalDna: result.emotionalDna || null,
      currentStep: updatedTurns.length,
      totalSteps: 6, // 目安
    });
  } catch (error) {
    return apiErrorResponse(error, "Hearing POST");
  }
}

// ── DELETE: ヒアリングリセット ──

export async function DELETE() {
  try {
    const store = await getOrCreateDefaultStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandMemoryModel = (prisma as any).brandMemory;
    if (!brandMemoryModel) {
      return Response.json(
        { error: "Brand Memoryモデルが利用できません" },
        { status: 500 },
      );
    }

    const memory = await brandMemoryModel.findUnique({
      where: { storeId: store.id },
    });

    if (memory) {
      await brandMemoryModel.update({
        where: { storeId: store.id },
        data: {
          hearingSession: "",
          hearingStatus: "none",
          emotionalDna: "",
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, "Hearing DELETE");
  }
}

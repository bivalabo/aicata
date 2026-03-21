import { NextResponse } from "next/server";
import {
  listConversations,
  createConversation,
} from "@/lib/services/conversation-service";

// GET /api/conversations — list all conversations
export async function GET() {
  try {
    const conversations = await listConversations();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("List conversations error:", error);
    return NextResponse.json(
      { error: "会話一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST /api/conversations — create a new conversation
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = await createConversation(body.type, body.title);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "会話の作成に失敗しました" },
      { status: 500 },
    );
  }
}

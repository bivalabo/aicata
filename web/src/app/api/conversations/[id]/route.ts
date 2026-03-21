import { NextResponse } from "next/server";
import {
  getConversation,
  deleteConversation,
  updateConversationTitle,
} from "@/lib/services/conversation-service";

// GET /api/conversations/[id] — get conversation with messages
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const conversation = await getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { error: "会話が見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "会話の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// PATCH /api/conversations/[id] — update conversation (title, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.title) {
      await updateConversationTitle(id, body.title);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update conversation error:", error);
    return NextResponse.json(
      { error: "会話の更新に失敗しました" },
      { status: 500 },
    );
  }
}

// DELETE /api/conversations/[id] — delete conversation
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteConversation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { error: "会話の削除に失敗しました" },
      { status: 500 },
    );
  }
}

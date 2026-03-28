// Removed - debug endpoint no longer needed
export async function GET() {
  return Response.json({ message: "This debug endpoint has been removed." }, { status: 404 });
}

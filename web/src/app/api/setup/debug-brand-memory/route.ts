// Temporary debug endpoint to test BrandMemory upsert
import { prisma } from "@/lib/db";

export async function GET() {
  const results: string[] = [];

  try {
    // Step 1: Find store
    results.push("Step 1: Finding store...");
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });
    if (!store) {
      return Response.json({ error: "No store found", results });
    }
    results.push(`Store found: id=${store.id}, name=${store.name}`);

    // Step 2: Check if brandMemory model exists on prisma
    results.push("Step 2: Checking brandMemory model...");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any).brandMemory;
    results.push(`Model exists: ${!!model}`);
    results.push(`Model type: ${typeof model}`);
    if (model) {
      results.push(`Has findUnique: ${typeof model.findUnique}`);
      results.push(`Has upsert: ${typeof model.upsert}`);
    }

    // Step 3: Try findUnique
    results.push("Step 3: Finding existing BrandMemory...");
    let existing = null;
    try {
      existing = await model.findUnique({ where: { storeId: store.id } });
      results.push(`Existing: ${existing ? "found" : "null"}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`FindUnique error: ${msg.slice(0, 300)}`);
    }

    // Step 4: Try upsert
    results.push("Step 4: Testing upsert...");
    try {
      const data = {
        brandName: "debug-test",
        industry: "general",
        source: "manual",
      };
      const memory = await model.upsert({
        where: { storeId: store.id },
        create: { storeId: store.id, ...data },
        update: data,
      });
      results.push(`Upsert success! id=${memory.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`Upsert error: ${msg.slice(0, 500)}`);

      // Step 4b: Try raw SQL insert as fallback test
      results.push("Step 4b: Testing raw SQL...");
      try {
        const rawResult = await prisma.$queryRawUnsafe(
          `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'BrandMemory' ORDER BY ordinal_position`
        );
        results.push(`BrandMemory columns: ${JSON.stringify(rawResult)}`);
      } catch (e2: unknown) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        results.push(`Raw SQL error: ${msg2.slice(0, 300)}`);
      }
    }

    return Response.json({ success: true, results });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg.slice(0, 500), results });
  }
}

import { assembleFullHtml } from "../page-assembler";
import { LUXURY_BEAUTY_TOP } from "../knowledge/templates/luxury-beauty-top";
import * as fs from "fs";

const fullHtml = assembleFullHtml(LUXURY_BEAUTY_TOP);

const htmlDoc = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aicata Gen-3 — Luxury Beauty Top (Assembled)</title>
</head>
<body>
${fullHtml}
</body>
</html>`;

const outPath = "/sessions/sweet-sleepy-johnson/mnt/Aicata/gen3-assembled-demo.html";
fs.writeFileSync(outPath, htmlDoc, "utf-8");
console.log(`✓ Demo HTML written to: ${outPath}`);
console.log(`  Size: ${(htmlDoc.length / 1024).toFixed(1)} KB`);

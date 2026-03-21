#!/usr/bin/env node

/**
 * patch-files.js
 * Applies targeted string replacements to migrate from SQLite to Supabase.
 * This script is idempotent: it checks if each change has already been applied.
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf-8");
}

function patchFile(filePath, oldString, newString, description) {
  if (!fileExists(filePath)) {
    log(colors.yellow, `⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = readFile(filePath);

  // Check if already patched
  if (content.includes(newString)) {
    log(colors.yellow, `⊘  Already patched: ${description}`);
    return true;
  }

  // Check if old string exists
  if (!content.includes(oldString)) {
    log(
      colors.red,
      `✗ Could not find pattern to patch: ${description}`
    );
    return false;
  }

  // Apply patch
  content = content.replace(oldString, newString);
  writeFile(filePath, content);
  log(colors.green, `✓ Patched: ${description}`);
  return true;
}

function createFile(filePath, content, description) {
  if (fileExists(filePath)) {
    log(colors.yellow, `⊘  File already exists: ${description}`);
    return true;
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  writeFile(filePath, content);
  log(colors.green, `✓ Created: ${description}`);
  return true;
}

// ============================================================
// Main Patches
// ============================================================

log(colors.blue, "\n🔨 Applying patches...\n");

const projectRoot = process.cwd();

// 1. Patch prisma/schema.prisma
log(colors.blue, "→ Patching prisma/schema.prisma");
const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");

patchFile(
  schemaPath,
  'provider = "sqlite"',
  'provider = "postgresql"',
  "Change SQLite to PostgreSQL provider"
);

patchFile(
  schemaPath,
  "datasource db {\n  provider = \"postgresql\"",
  'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")',
  "Add DATABASE_URL and DIRECT_URL to datasource"
);

patchFile(
  schemaPath,
  "generator client {\n  provider = \"prisma-client-js\"\n}",
  'generator client {\n  provider = "prisma-client-js"\n  previewFeatures = ["driverAdapters"]\n}',
  "Add driverAdapters preview feature"
);

// 2. Patch src/lib/db.ts
log(colors.blue, "→ Patching src/lib/db.ts");
const dbPath = path.join(projectRoot, "src", "lib", "db.ts");

const newDbContent = `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
`;

if (fileExists(dbPath)) {
  const currentContent = readFile(dbPath);
  if (
    currentContent.includes("@prisma/adapter-better-sqlite3") ||
    currentContent.includes("PrismaBetterSqlite3")
  ) {
    writeFile(dbPath, newDbContent);
    log(colors.green, "✓ Patched: Replace SQLite adapter with standard Prisma");
  } else {
    log(colors.yellow, "⊘  Already patched: SQLite adapter removed");
  }
} else {
  log(colors.yellow, `⚠️  File not found: ${dbPath}`);
}

// 3. Create src/lib/supabase.ts
log(colors.blue, "→ Creating src/lib/supabase.ts");
const supabasePath = path.join(projectRoot, "src", "lib", "supabase.ts");
const supabaseContent = `import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
`;
createFile(supabasePath, supabaseContent, "Create Supabase browser client");

// 4. Create src/lib/supabase-server.ts
log(colors.blue, "→ Creating src/lib/supabase-server.ts");
const supabaseServerPath = path.join(
  projectRoot,
  "src",
  "lib",
  "supabase-server.ts"
);
const supabaseServerContent = `import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    },
  );
}
`;
createFile(
  supabaseServerPath,
  supabaseServerContent,
  "Create Supabase server client"
);

// 5. Patch UI files - SiteMapView.tsx
log(colors.blue, "→ Patching SiteMapView.tsx");
const siteMapViewPath = path.join(
  projectRoot,
  "src",
  "components",
  "pages",
  "SiteMapView.tsx"
);

patchFile(
  siteMapViewPath,
  "shrink-0 px-6 pt-6 pb-4",
  "shrink-0 px-8 pt-14 pb-6",
  "Update SiteMapView padding"
);

patchFile(
  siteMapViewPath,
  "text-xl font-bold",
  "text-2xl font-bold",
  "Update SiteMapView title size"
);

// 6. Patch UI files - SiteBuilderView.tsx
log(colors.blue, "→ Patching SiteBuilderView.tsx");
const siteBuilderViewPath = path.join(
  projectRoot,
  "src",
  "components",
  "site-builder",
  "SiteBuilderView.tsx"
);

patchFile(
  siteBuilderViewPath,
  "shrink-0 px-6 pt-6 pb-4",
  "shrink-0 px-8 pt-14 pb-6",
  "Update SiteBuilderView padding"
);

patchFile(
  siteBuilderViewPath,
  "text-xl font-bold",
  "text-2xl font-bold",
  "Update SiteBuilderView title size"
);

// 7. Patch UI files - Sidebar.tsx
log(colors.blue, "→ Patching Sidebar.tsx");
const sidebarPath = path.join(
  projectRoot,
  "src",
  "components",
  "layout",
  "Sidebar.tsx"
);

patchFile(
  sidebarPath,
  "text-muted-foreground uppercase tracking-widest",
  "text-foreground/60 uppercase tracking-widest",
  "Update Sidebar project header text color"
);

patchFile(
  sidebarPath,
  ': "text-muted-foreground",',
  ': "text-foreground/70",',
  "Update Sidebar conversation title inactive color"
);

patchFile(
  sidebarPath,
  "text-muted-foreground/50\"",
  "text-foreground/40\"",
  "Update Sidebar RelativeTime color"
);

patchFile(
  sidebarPath,
  "text-muted-foreground/40",
  "text-foreground/30",
  "Update Sidebar default icon color"
);

patchFile(
  sidebarPath,
  "text-muted-foreground px-3 py-8",
  "text-foreground/50 px-3 py-8",
  "Update Sidebar empty state color"
);

// 8. Patch SettingsView.tsx — larger font sizes and wider layout
log(colors.blue, "→ Patching SettingsView.tsx");
const settingsViewPath = path.join(
  projectRoot,
  "src",
  "components",
  "settings",
  "SettingsView.tsx"
);

// Layout: max-w-xl → max-w-3xl, px-6 py-10 → px-8 pt-16 pb-14
patchFile(
  settingsViewPath,
  "max-w-xl mx-auto px-6 py-10",
  "max-w-3xl mx-auto px-8 pt-16 pb-14",
  "SettingsView: widen layout and add top padding"
);

// Title: text-xl → text-3xl, mb-1 → mb-2
patchFile(
  settingsViewPath,
  'text-xl font-bold text-foreground mb-1">設定',
  'text-3xl font-bold text-foreground mb-2">設定',
  "SettingsView: increase title size"
);

// Subtitle: text-sm → text-[15px], mb-8 → mb-10
patchFile(
  settingsViewPath,
  "text-sm text-muted-foreground mb-8",
  "text-[15px] text-muted-foreground mb-10",
  "SettingsView: increase subtitle size"
);

// Brand Memory section margin
patchFile(
  settingsViewPath,
  '"mb-10">',
  '"mb-12">',
  "SettingsView: increase Brand Memory section margin"
);

// Shopify header: px-5 py-4 → px-6 py-5, gap-3 → gap-4
patchFile(
  settingsViewPath,
  "px-5 py-4 border-b border-border/50 flex items-center gap-3",
  "px-6 py-5 border-b border-border/50 flex items-center gap-4",
  "SettingsView: increase Shopify header padding"
);

// Icon box: w-10 h-10 → w-12 h-12
patchFile(
  settingsViewPath,
  "w-10 h-10 rounded-xl flex items-center justify-center",
  "w-12 h-12 rounded-xl flex items-center justify-center",
  "SettingsView: increase icon box size"
);

// Store icon: w-5 h-5 → w-6 h-6
patchFile(
  settingsViewPath,
  '<Store className="w-5 h-5 text-white"',
  '<Store className="w-6 h-6 text-white"',
  "SettingsView: increase store icon size"
);

// Shopify title: text-[15px] → text-[18px]
patchFile(
  settingsViewPath,
  'text-[15px] font-semibold text-foreground">\n                Shopifyストア接続',
  'text-[18px] font-semibold text-foreground">\n                Shopifyストア接続',
  "SettingsView: increase Shopify title size"
);

// Status label: text-[12px] → text-[14px] (multiple)
patchFile(
  settingsViewPath,
  'text-[12px] text-muted-foreground">\n                {connected',
  'text-[14px] text-muted-foreground">\n                {connected',
  "SettingsView: increase status label size"
);

// Connected badge: text-[12px] → text-[14px]
patchFile(
  settingsViewPath,
  'gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[12px]',
  'gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-[14px]',
  "SettingsView: increase connected badge size"
);

// Content padding: p-5 → p-6
patchFile(
  settingsViewPath,
  '"p-5">\n            {connected && store',
  '"p-6">\n            {connected && store',
  "SettingsView: increase content padding"
);

// Store detail labels: text-[12px] → text-[14px]
patchFile(
  settingsViewPath,
  'text-[12px] text-muted-foreground block mb-0.5',
  'text-[14px] text-muted-foreground block mb-1',
  "SettingsView: increase store detail labels"
);

// 9. Patch BrandMemoryView.tsx — larger font sizes and wider layout
log(colors.blue, "→ Patching BrandMemoryView.tsx");
const brandMemoryViewPath = path.join(
  projectRoot,
  "src",
  "components",
  "settings",
  "BrandMemoryView.tsx"
);

// Container: max-w-2xl → max-w-3xl, space-y-8 → space-y-10
patchFile(
  brandMemoryViewPath,
  "max-w-2xl mx-auto space-y-8",
  "max-w-3xl mx-auto space-y-10",
  "BrandMemoryView: widen layout"
);

// Header gap: gap-3 → gap-4
patchFile(
  brandMemoryViewPath,
  '"flex items-center gap-3">\n        <div className="w-10 h-10',
  '"flex items-center gap-4">\n        <div className="w-12 h-12',
  "BrandMemoryView: increase header icon size"
);

// Brain icon: w-5 h-5 → w-6 h-6
patchFile(
  brandMemoryViewPath,
  '<Brain className="w-5 h-5 text-white"',
  '<Brain className="w-6 h-6 text-white"',
  "BrandMemoryView: increase Brain icon size"
);

// Title: text-[17px] → text-[22px]
patchFile(
  brandMemoryViewPath,
  'text-[17px] font-bold text-foreground">\n            Brand Memory',
  'text-[22px] font-bold text-foreground">\n            Brand Memory',
  "BrandMemoryView: increase title size"
);

// Description: text-[12px] → text-[15px]
patchFile(
  brandMemoryViewPath,
  'text-[12px] text-muted-foreground">\n            相方があなたのブランドを記憶',
  'text-[15px] text-muted-foreground">\n            相方があなたのブランドを記憶',
  "BrandMemoryView: increase description size"
);

// Save bar: max-w-xl → max-w-3xl (sticky bottom)
patchFile(
  brandMemoryViewPath,
  "max-w-xl mx-auto px-6 pb-4",
  "max-w-3xl mx-auto px-8 pb-6",
  "BrandMemoryView: widen sticky save bar"
);

// 10. Patch next.config.ts — remove FUSE polling workaround
log(colors.blue, "→ Patching next.config.ts");
const nextConfigPath = path.join(projectRoot, "next.config.ts");

if (fileExists(nextConfigPath)) {
  let nextConfigContent = readFile(nextConfigPath);
  if (nextConfigContent.includes("webpack: (config, { dev })")) {
    // Remove the entire webpack config block
    nextConfigContent = nextConfigContent.replace(
      /\n  \/\/ FUSE マウント環境では.*?\n  webpack: \(config, \{ dev \}\) => \{[\s\S]*?\n  \},\n/,
      "\n"
    );
    writeFile(nextConfigPath, nextConfigContent);
    log(colors.green, "✓ Patched: Remove FUSE polling workaround from next.config.ts");
  } else {
    log(colors.yellow, "⊘  Already patched: FUSE polling workaround removed");
  }
} else {
  log(colors.yellow, "⚠️  File not found: next.config.ts");
}

// 11. Migrate chat API routes to Vercel AI SDK 6
log(colors.blue, "→ Migrating chat API to Vercel AI SDK");

// Replace the non-streaming route
const chatRoutePath = path.join(projectRoot, "src", "app", "api", "chat", "route.ts");
const chatRouteV2Path = chatRoutePath + ".v2";
if (fileExists(chatRouteV2Path)) {
  if (fileExists(chatRoutePath)) {
    const currentRoute = readFile(chatRoutePath);
    if (currentRoute.includes("from \"ai\"") || currentRoute.includes("from 'ai'")) {
      log(colors.yellow, "⊘  Already migrated: chat/route.ts");
    } else {
      const v2Content = readFile(chatRouteV2Path);
      writeFile(chatRoutePath, v2Content);
      log(colors.green, "✓ Migrated: chat/route.ts → Vercel AI SDK");
    }
  }
  // Clean up .v2 file
  try { fs.unlinkSync(chatRouteV2Path); } catch { /* ignore */ }
}

// Replace the streaming route
const chatStreamRoutePath = path.join(projectRoot, "src", "app", "api", "chat", "stream", "route.ts");
const chatStreamRouteV2Path = chatStreamRoutePath + ".v2";
if (fileExists(chatStreamRouteV2Path)) {
  if (fileExists(chatStreamRoutePath)) {
    const currentStreamRoute = readFile(chatStreamRoutePath);
    if (currentStreamRoute.includes("from \"ai\"") || currentStreamRoute.includes("from 'ai'")) {
      log(colors.yellow, "⊘  Already migrated: chat/stream/route.ts");
    } else {
      const v2StreamContent = readFile(chatStreamRouteV2Path);
      writeFile(chatStreamRoutePath, v2StreamContent);
      log(colors.green, "✓ Migrated: chat/stream/route.ts → Vercel AI SDK");
    }
  }
  // Clean up .v2 file
  try { fs.unlinkSync(chatStreamRouteV2Path); } catch { /* ignore */ }
}

// 12. Patch package.json scripts
log(colors.blue, "→ Patching package.json scripts");
const packageJsonPath = path.join(projectRoot, "package.json");

let packageJson = readFile(packageJsonPath);
const packageObj = JSON.parse(packageJson);

// Check if scripts need updating
const needsUpdate =
  packageObj.scripts.dev.includes("sync-watch") ||
  packageObj.scripts["dev:fresh"].includes("sync-watch") ||
  !packageObj.scripts["db:push"];

if (needsUpdate) {
  packageObj.scripts.dev = "next dev";
  packageObj.scripts["dev:fresh"] = "rm -rf .next node_modules/.cache && next dev";
  packageObj.scripts["db:push"] = "npx prisma db push";
  packageObj.scripts["db:migrate"] = "npx prisma migrate dev";
  packageObj.scripts["db:studio"] = "npx prisma studio";

  writeFile(packageJsonPath, JSON.stringify(packageObj, null, 2) + "\n");
  log(colors.green, "✓ Patched: Update package.json scripts");
} else {
  log(colors.yellow, "⊘  Already patched: package.json scripts");
}

log(colors.blue, "\n✓ All patches applied successfully!\n");

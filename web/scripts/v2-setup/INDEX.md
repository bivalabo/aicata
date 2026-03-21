# V2 Setup Files Index

Complete documentation of all setup files for SQLite → Supabase + Vercel migration.

## 📁 File Structure

```
/sessions/nice-great-rubin/mnt/aicata/web/scripts/v2-setup/
├── setup.sh                    # Master setup script (run from web/ directory)
├── patch-files.js              # Node.js patch application script
├── .env.example                # Environment variables template
├── vercel.json                 # Vercel configuration
├── README-setup.md             # Japanese step-by-step guide
└── INDEX.md                    # This file
```

---

## 📋 File Descriptions

### 1. `setup.sh` - Master Setup Script

**Location**: `/sessions/nice-great-rubin/mnt/aicata/web/scripts/v2-setup/setup.sh`

**Purpose**: Orchestrates the entire migration process with a single command.

**How to Run**:
```bash
cd /sessions/nice-great-rubin/mnt/aicata/web
bash scripts/v2-setup/setup.sh
```

**What It Does**:
1. Validates you're in the correct directory (checks for `package.json` and `prisma/`)
2. Installs new dependencies:
   - `@supabase/supabase-js`
   - `@supabase/ssr`
   - `ai` (Vercel AI SDK)
   - `@ai-sdk/anthropic`
   - `@measured/puck`
3. Removes SQLite dependencies:
   - `@prisma/adapter-better-sqlite3`
   - `better-sqlite3`
4. Copies `.env.example` to project root
5. Runs the Node.js patch script (`patch-files.js`)
6. Generates Prisma client
7. Copies `vercel.json` configuration
8. Prints next steps and important notes

**Output**: User-friendly colored output showing progress and next steps.

---

### 2. `patch-files.js` - Code Patch Application Script

**Location**: `/sessions/nice-great-rubin/mnt/aicata/web/scripts/v2-setup/patch-files.js`

**Purpose**: Applies targeted string replacements to source files. Idempotent (safe to run multiple times).

**How It's Used**:
- Automatically called by `setup.sh`
- Can be run manually: `node scripts/v2-setup/patch-files.js`

**Patches Applied**:

#### Database Configuration
- **File**: `prisma/schema.prisma`
  - Change `provider = "sqlite"` → `provider = "postgresql"`
  - Add `url = env("DATABASE_URL")`
  - Add `directUrl = env("DIRECT_URL")`
  - Add `previewFeatures = ["driverAdapters"]` to generator

#### ORM Client
- **File**: `src/lib/db.ts`
  - Removes `@prisma/adapter-better-sqlite3` import
  - Removes `PrismaBetterSqlite3` adapter setup
  - Replaces with standard `new PrismaClient()`
  - Keeps singleton pattern for development

#### Supabase Integration (New Files)
- **File**: `src/lib/supabase.ts` (created)
  - Browser-side Supabase client factory
  - Uses `createBrowserClient` from `@supabase/ssr`

- **File**: `src/lib/supabase-server.ts` (created)
  - Server-side Supabase client factory
  - Uses `createServerClient` from `@supabase/ssr`
  - Handles cookies for authentication

#### UI Component Updates
- **File**: `src/components/pages/SiteMapView.tsx`
  - Padding: `px-6 pt-6 pb-4` → `px-8 pt-14 pb-6`
  - Title: `text-xl font-bold` → `text-2xl font-bold`

- **File**: `src/components/site-builder/SiteBuilderView.tsx`
  - Padding: `px-6 pt-6 pb-4` → `px-8 pt-14 pb-6`
  - Title: `text-xl font-bold` → `text-2xl font-bold`

- **File**: `src/components/layout/Sidebar.tsx`
  - Project header: `text-muted-foreground` → `text-foreground/60`
  - Conversation title (inactive): `text-muted-foreground` → `text-foreground/70`
  - RelativeTime text: `text-muted-foreground/50` → `text-foreground/40`
  - Default icon: `text-muted-foreground/40` → `text-foreground/30`
  - Empty state: `text-muted-foreground px-3 py-8` → `text-foreground/50 px-3 py-8`

#### Package.json Scripts
- Remove `sync-watch.js` from dev scripts (no longer needed with Vercel)
- `dev`: `next dev` (previously had sync-watch)
- `dev:fresh`: `rm -rf .next node_modules/.cache && next dev`
- Add `db:push`: `npx prisma db push`
- Add `db:migrate`: `npx prisma migrate dev`
- Add `db:studio`: `npx prisma studio`

**Safety Features**:
- Checks if each change is already applied before applying
- Verifies files exist before patching
- Creates new files if they don't exist
- Prints colored status messages for each operation
- Logs failures so user knows what wasn't patched

**Key Implementation Details**:
- Uses `String.includes()` to detect if patch already applied
- Uses simple `String.replace()` for targeted replacements
- Handles JSON parsing/stringification for package.json
- Creates directories recursively if needed

---

### 3. `.env.example` - Environment Variables Template

**Location**: `/sessions/nice-great-rubin/mnt/aicata/web/scripts/v2-setup/.env.example`

**Purpose**: Reference template for all required environment variables.

**How to Use**:
```bash
# Copied by setup.sh, but you can also:
cp scripts/v2-setup/.env.example .env.local
# Then edit .env.local with your actual credentials
```

**Environment Variables**:

**Supabase Section**:
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL from Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key for client-side
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations

**Database Section**:
- `DATABASE_URL`: PostgreSQL connection with pgBouncer (serverless)
- `DIRECT_URL`: Direct PostgreSQL connection (for migrations)

**Anthropic API**:
- `ANTHROPIC_API_KEY`: Claude API key
- `CLAUDE_MODEL_DEFAULT`: Default model to use

**Shopify Integration**:
- `SHOPIFY_API_KEY`: API key from Shopify Partner dashboard
- `SHOPIFY_API_SECRET`: API secret
- `APP_URL`: Your production app URL

**NextAuth Configuration**:
- `NEXTAUTH_SECRET`: Generated with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your production app URL

**Important Notes**:
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Secrets should NOT have `NEXT_PUBLIC_` prefix
- The file is NOT committed to git (add to `.gitignore`)
- Each environment (dev, preview, production) needs its own copy

---

### 4. `vercel.json` - Vercel Configuration

**Location**: `/sessions/nice-great-rubin/mnt/aicata/web/scripts/v2-setup/vercel.json`

**Purpose**: Tells Vercel this is a Next.js project and how to handle deployment.

**Contents**:
```json
{
  "framework": "nextjs"
}
```

**What It Does**:
- Explicitly tells Vercel to use Next.js build/runtime
- Enables Next.js-specific optimizations on Vercel
- Copied by `setup.sh` to project root

**When It's Used**:
- During Vercel build process
- Vercel reads this file to determine build/deploy behavior
- Can be extended with additional Vercel-specific settings if needed

**Reference**:
- [Vercel Project Configuration](https://vercel.com/docs/projects/project-configuration)

---

### 5. `README-setup.md` - Japanese Setup Guide

**Location**: `/sessions/nice-great-rubin/mnt/aicata/web/scripts/v2-setup/README-setup.md`

**Purpose**: Comprehensive step-by-step guide in Japanese for the entire migration process.

**Sections**:
1. **概要** (Overview): What's changing and why
2. **セットアップ手順** (Setup Steps):
   - Step 1: Create Supabase project
   - Step 2: Prepare GitHub repository
   - Step 3: Create Vercel project
   - Step 4: Configure environment variables in Vercel
   - Step 5: Run setup script locally
   - Step 6: Run Prisma migrations
   - Step 7: Verify locally
   - Step 8: Deploy to Vercel

3. **使用可能なコマンド** (Available Commands): Reference for npm scripts
4. **セキュリティチェックリスト** (Security Checklist): Important verifications
5. **トラブルシューティング** (Troubleshooting): Common issues and solutions
6. **参考資料** (References): Links to external documentation
7. **サポート** (Support): Where to get help

**Key Information**:
- **DATABASE_URL vs DIRECT_URL**: Explains the difference
- **pgBouncer**: Why it's needed for serverless
- **Environment variables table**: Clear mapping of each variable
- **Security checklist**: Important before going to production

---

## 🔄 Setup Workflow

### Recommended Execution Order

1. **Supabase Setup** (Manual)
   - Create Supabase project
   - Get connection credentials

2. **GitHub Setup** (Manual)
   - Create GitHub repository
   - Push local code

3. **Vercel Setup** (Manual)
   - Create Vercel project
   - Link to GitHub
   - Configure environment variables

4. **Run setup.sh** (Automated)
   - Executes all automated setup
   - Installs dependencies
   - Applies patches
   - Generates Prisma client

5. **Local Verification** (Manual)
   - Copy .env.example to .env.local
   - Run migrations
   - Start dev server
   - Test functionality

6. **Deploy** (Automated)
   - Push changes to GitHub
   - Vercel auto-deploys
   - Verify production

---

## 🔍 File Dependencies

```
setup.sh
├── patch-files.js (called by setup.sh)
│   ├── prisma/schema.prisma (modified)
│   ├── src/lib/db.ts (modified)
│   ├── src/lib/supabase.ts (created)
│   ├── src/lib/supabase-server.ts (created)
│   ├── src/components/pages/SiteMapView.tsx (modified)
│   ├── src/components/site-builder/SiteBuilderView.tsx (modified)
│   ├── src/components/layout/Sidebar.tsx (modified)
│   └── package.json (modified)
├── .env.example (copied to project root)
└── vercel.json (copied to project root)

.env.example
└── Used to create .env.local (local development)

vercel.json
└── Copied to project root for Vercel deployment

README-setup.md
└── Reference guide for manual steps (Supabase, GitHub, Vercel)
```

---

## ✅ Validation Checklist

After running all setup steps, verify:

- [ ] `npm install` completed successfully
- [ ] SQLite packages removed from `node_modules`
- [ ] `.env.example` exists in project root
- [ ] `.env.local` created and filled with credentials
- [ ] `prisma/schema.prisma` uses PostgreSQL
- [ ] `src/lib/db.ts` uses standard PrismaClient
- [ ] `src/lib/supabase.ts` exists
- [ ] `src/lib/supabase-server.ts` exists
- [ ] `package.json` has new npm scripts
- [ ] `vercel.json` exists in project root
- [ ] `npm run dev` starts successfully
- [ ] Database tables created via `npm run db:push`
- [ ] Vercel environment variables configured
- [ ] GitHub repository linked to Vercel
- [ ] Production deployment successful

---

## 📝 Important Notes

### About the FUSE Mount Issue

The setup script is designed to run on the **HOST macOS terminal**, not in the VM, because:
- FUSE mounts don't properly propagate file changes to the Turbopack dev server
- File watchers on the VM don't detect changes from the host
- Running the script on the host ensures all changes are properly detected
- The dev server will start correctly and see all modified files

### Idempotency

All scripts are **idempotent**, meaning they're safe to run multiple times:
- `patch-files.js` checks if changes are already applied
- `setup.sh` can be re-run if interrupted
- Existing files won't be overwritten accidentally

### Environment Variable Scope

- **Local Development**: Use `.env.local` (not committed to git)
- **Vercel Preview**: Use preview environment variables
- **Vercel Production**: Use production environment variables
- **Public Variables**: Only `NEXT_PUBLIC_*` exposed to browser

---

## 🔗 Related Files in Project

After setup completes, these project files are modified:
- `/sessions/nice-great-rubin/mnt/aicata/web/prisma/schema.prisma`
- `/sessions/nice-great-rubin/mnt/aicata/web/src/lib/db.ts`
- `/sessions/nice-great-rubin/mnt/aicata/web/src/lib/supabase.ts` (created)
- `/sessions/nice-great-rubin/mnt/aicata/web/src/lib/supabase-server.ts` (created)
- `/sessions/nice-great-rubin/mnt/aicata/web/src/components/pages/SiteMapView.tsx`
- `/sessions/nice-great-rubin/mnt/aicata/web/src/components/site-builder/SiteBuilderView.tsx`
- `/sessions/nice-great-rubin/mnt/aicata/web/src/components/layout/Sidebar.tsx`
- `/sessions/nice-great-rubin/mnt/aicata/web/package.json`
- `/sessions/nice-great-rubin/mnt/aicata/web/.env.example` (copied)
- `/sessions/nice-great-rubin/mnt/aicata/web/vercel.json` (copied)

---

**Last Updated**: 2026-03-20
**Setup Version**: V2
**Target Node Version**: 18+
**Target Next.js Version**: 16+

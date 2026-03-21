# 🎯 START HERE - V2 Migration Setup

Welcome! This directory contains everything needed to migrate your Next.js project from SQLite to Supabase + Vercel deployment.

---

## 📚 Documentation Guide

Choose your path based on your experience level:

### 🚀 **New to this migration?**
→ Start with **QUICK-START.md** (15-20 min read)
- Fast overview of all steps
- Command-by-command instructions
- No deep technical details

### 📖 **Want detailed explanations?**
→ Read **README-setup.md** (30-40 min read)
- Step-by-step in Japanese
- Detailed screenshots/references
- Troubleshooting guide
- Security checklist

### 🔍 **Need technical details?**
→ Consult **INDEX.md** (reference)
- What each file does
- All patches explained
- File dependencies
- Implementation details

### 📋 **Need complete inventory?**
→ Check **MANIFEST.md** (reference)
- All patches listed
- File impact analysis
- Configuration details
- Known limitations

---

## ⚡ The 5-Minute Path

If you already have Supabase & Vercel projects set up:

```bash
# 1. Run the setup script from project root (HOST macOS terminal!)
cd /sessions/nice-great-rubin/mnt/aicata/web
bash scripts/v2-setup/setup.sh

# 2. Configure local environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run database migration
npm run db:push

# 4. Verify locally
npm run dev
# Check http://localhost:3000

# 5. Deploy
git add .
git commit -m "chore: migrate to Supabase"
git push origin main
# Vercel auto-deploys
```

---

## 📦 What's Included

```
scripts/v2-setup/
├── setup.sh                    # Main script - run this!
├── patch-files.js              # Handles all code changes
├── .env.example                # Environment variable template
├── vercel.json                 # Vercel configuration
├── 00-START-HERE.md           # This file
├── QUICK-START.md             # Fast-track guide (5-20 min)
├── README-setup.md            # Detailed guide (30-40 min)
├── INDEX.md                   # Technical reference
└── MANIFEST.md                # Complete inventory
```

---

## ✅ Prerequisites

Before running setup.sh, you need:

- [ ] **Supabase Project** - Create at https://supabase.com
  - Get: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL, DIRECT_URL

- [ ] **GitHub Repository** - Push your code to GitHub
  - Run: `git push origin main`

- [ ] **Vercel Project** - Create at https://vercel.com
  - Link: Connect to your GitHub repo
  - Set: Environment variables in Vercel dashboard

- [ ] **This Terminal** - Running on HOST macOS (not VM)
  - Why: FUSE mount doesn't propagate file changes to Turbopack

---

## 🚀 Quick Execution

### Step 1: Create Supabase Project
```
1. Go to https://supabase.com/dashboard
2. New Project → aicata-prod
3. Settings → Database → Connection strings
4. Copy: DATABASE_URL, DIRECT_URL, and API keys
```

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/you/aicata-web
git push -u origin main
```

### Step 3: Create Vercel Project
```
1. Go to https://vercel.com/new
2. Import Git Repository → Select repo
3. Set Environment Variables (use Supabase values)
4. Deploy (optional - we'll do it after setup)
```

### Step 4: Run Setup Script (⚠️ On HOST macOS terminal)
```bash
cd /sessions/nice-great-rubin/mnt/aicata/web
bash scripts/v2-setup/setup.sh
```

### Step 5: Local Testing
```bash
cp .env.example .env.local
# Edit .env.local with Supabase credentials

npm run db:push        # Create database tables
npm run dev            # Start development server
# Visit http://localhost:3000
```

### Step 6: Deploy to Vercel
```bash
git add .
git commit -m "chore: migrate to Supabase"
git push origin main
# Vercel auto-deploys!
```

---

## 🔄 What the Script Does

Running `setup.sh` automatically:

1. **Installs Dependencies**
   - @supabase/supabase-js, @supabase/ssr
   - @ai-sdk/anthropic, ai (Vercel AI SDK)
   - @measured/puck

2. **Removes SQLite Packages**
   - @prisma/adapter-better-sqlite3
   - better-sqlite3

3. **Applies Code Patches** (idempotent - safe to re-run)
   - ✓ prisma/schema.prisma: SQLite → PostgreSQL
   - ✓ src/lib/db.ts: Remove SQLite adapter
   - ✓ Creates src/lib/supabase.ts (browser client)
   - ✓ Creates src/lib/supabase-server.ts (server client)
   - ✓ Updates UI components (padding/sizing)
   - ✓ Updates package.json scripts

4. **Generates Prisma Client**
   - npx prisma generate

5. **Copies Configuration**
   - vercel.json to project root
   - .env.example to project root

---

## 📋 Environment Variables

After running setup, copy `.env.example` to `.env.local` and fill in:

```env
# Get from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
DATABASE_URL=postgresql://...?pgbouncer=true    # With pgbouncer!
DIRECT_URL=postgresql://...                      # Without pgbouncer!

# Get from your API providers
ANTHROPIC_API_KEY=sk-ant-...
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=...

# Your Vercel domain
NEXTAUTH_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app
```

**Important**: Also set these in Vercel project Settings → Environment Variables!

---

## 🆘 Quick Troubleshooting

### "Cannot find module @prisma/adapter-better-sqlite3"
→ Run: `npm install` (the script should have done this)

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
→ Run: `cp .env.example .env.local` and fill in values

### "Database connection error"
→ Verify DATABASE_URL has `?pgbouncer=true`
→ Verify DIRECT_URL does NOT have `?pgbouncer=true`

### "Turbopack not detecting file changes"
→ Make sure you're running on HOST macOS terminal
→ NOT in VM (FUSE mount doesn't propagate changes properly)

### "Vercel deploy fails"
→ Check Vercel logs: Dashboard → Deployments → Logs
→ Verify all environment variables are set in Vercel
→ Check DATABASE_URL is set (needed for migrations)

**For more help**: See README-setup.md "トラブルシューティング" section

---

## ✨ After Setup - What's Changed

**Modified Files**:
- prisma/schema.prisma (SQLite → PostgreSQL)
- src/lib/db.ts (removed adapter)
- package.json (new scripts, removed deps)
- UI components (minor padding/sizing)

**New Files Created**:
- src/lib/supabase.ts (browser client)
- src/lib/supabase-server.ts (server client)
- .env.example (template)
- vercel.json (config)

**NOT Changed**:
- All API routes ✓
- All database queries ✓
- Business logic ✓
- Data models ✓

---

## 📖 Reading Order

For first-time setup, follow this order:

1. **This file** (you're reading it now!) - 5 min
2. **QUICK-START.md** - 15 min
3. Run `setup.sh` - 2 min
4. **README-setup.md** sections 6-8 - 10 min
5. Local testing - 5 min
6. Deploy to Vercel - 1 min

**Total: ~40 minutes**

---

## 🎓 Next Steps

After successful setup:

1. **Explore Supabase**
   - Dashboard: https://supabase.com/dashboard
   - SQL Editor: Write queries
   - Authentication: Set up user auth
   - Real-time: Enable subscriptions

2. **Explore Vercel**
   - Dashboard: https://vercel.com/dashboard
   - Deployments: Monitor builds
   - Analytics: Performance metrics
   - Edge Config: Feature flags

3. **Extend Your App**
   - Use Supabase SSR for auth
   - Add real-time features
   - Deploy more frequently
   - Scale with confidence

---

## 🔒 Security Reminders

- ✓ `.env.local` is in `.gitignore` (check!)
- ✓ Never commit secrets to GitHub
- ✓ Set environment variables in Vercel dashboard
- ✓ Use strong database password
- ✓ Rotate API keys regularly
- ✓ Generate NEXTAUTH_SECRET with: `openssl rand -base64 32`

---

## 📞 Need Help?

### Documentation
- **QUICK-START.md** - Fast overview
- **README-setup.md** - Detailed guide (Japanese)
- **INDEX.md** - Technical reference
- **MANIFEST.md** - Complete inventory

### External Resources
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

### Community Support
- Supabase Discord: https://discord.supabase.io
- Vercel Community: https://vercel.com/support
- Prisma Community: https://www.prisma.io/community

---

## ✅ Success Criteria

Your setup is successful when:

- [ ] `setup.sh` completes without errors
- [ ] `npm run dev` starts successfully
- [ ] http://localhost:3000 loads
- [ ] Database tables visible in Prisma Studio
- [ ] Vercel deployment succeeds
- [ ] Production URL works without errors

---

## 🎉 Ready?

**Run this command to get started**:

```bash
cd /sessions/nice-great-rubin/mnt/aicata/web
bash scripts/v2-setup/setup.sh
```

Then follow the printed next steps!

---

**Questions?** Check QUICK-START.md or README-setup.md
**Troubleshooting?** See INDEX.md or MANIFEST.md
**Technical details?** See MANIFEST.md

**Let's migrate! 🚀**

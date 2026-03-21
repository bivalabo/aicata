# 🚀 Quick Start Guide

Fast-track setup for experienced developers. For detailed instructions, see `README-setup.md`.

## Prerequisites

- GitHub account
- Supabase account (free tier available at supabase.com)
- Vercel account (free tier available at vercel.com)

## 1. Supabase Setup (5 minutes)

```
1. Go to https://supabase.com/dashboard
2. Create New Project
   - Name: aicata-prod
   - Region: Tokyo (or nearest)
   - Database password: [generate strong password]
3. Copy credentials:
   - Settings → Database → Connection strings
   - Copy DATABASE_URL (pgbouncer version)
   - Copy DIRECT_URL (regular version)
   - Copy NEXT_PUBLIC_SUPABASE_URL from API settings
   - Copy NEXT_PUBLIC_SUPABASE_ANON_KEY from API settings
```

## 2. GitHub Setup (2 minutes)

```bash
cd /sessions/nice-great-rubin/mnt/aicata/web
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aicata-web.git
git push -u origin main
```

## 3. Vercel Setup (3 minutes)

```
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Framework: Next.js (auto-detected)
5. Root: web/ (if applicable)
6. Click Import
7. Set Environment Variables (see step 4)
```

## 4. Environment Variables in Vercel

Add these to Vercel project Settings → Environment Variables:

| Variable | Value | Where to get |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co | Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJxxx... | Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJxxx... | Supabase API settings |
| `DATABASE_URL` | postgres://...?pgbouncer=true | Supabase Connection string |
| `DIRECT_URL` | postgres://... | Supabase Connection string |
| `ANTHROPIC_API_KEY` | sk-ant-xxx | https://console.anthropic.com |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Generate locally |
| `NEXTAUTH_URL` | https://your-app.vercel.app | Your Vercel domain |
| `SHOPIFY_API_KEY` | xxx | Shopify Partner Dashboard |
| `SHOPIFY_API_SECRET` | xxx | Shopify Partner Dashboard |
| `APP_URL` | https://your-app.vercel.app | Your Vercel domain |

## 5. Run Setup Script (2 minutes)

```bash
cd /sessions/nice-great-rubin/mnt/aicata/web
bash scripts/v2-setup/setup.sh
```

This script:
- ✓ Installs dependencies
- ✓ Removes SQLite packages
- ✓ Applies code patches
- ✓ Generates Prisma client
- ✓ Copies configuration files

## 6. Local Environment & Testing (5 minutes)

```bash
# Create local env file
cp .env.example .env.local

# Edit .env.local with YOUR credentials
# (use values from step 1)

# Run migrations
npm run db:push

# Start dev server
npm run dev

# Open http://localhost:3000
```

## 7. Deploy (1 minute)

```bash
git add .
git commit -m "chore: migrate to Supabase"
git push origin main
```

Vercel auto-deploys. Check progress at https://vercel.com/dashboard

---

## Commands Reference

```bash
npm run dev                 # Start dev server (uses .env.local)
npm run dev:fresh          # Clean cache and start
npm run build              # Build for production
npm run start              # Run production build locally
npm run db:push            # Sync Prisma schema to database
npm run db:migrate         # Create and run migrations
npm run db:studio          # Open Prisma Studio (http://localhost:5555)
npm run lint               # Run ESLint
```

---

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
```bash
cp .env.example .env.local
# Edit .env.local with actual values
```

### "Cannot connect to database"
```bash
# Check DATABASE_URL has ?pgbouncer=true
# Check DIRECT_URL does NOT have ?pgbouncer=true
# Verify credentials in Supabase dashboard
```

### "Prisma migration failed"
```bash
# Make sure DIRECT_URL is set correctly
# Direct URL needed for migrations (not pooled)
```

### "500 error after Vercel deploy"
Check Vercel logs: https://vercel.com/dashboard → Select project → Deployments → Logs

---

## Files Created/Modified

**Created**:
- `src/lib/supabase.ts` (browser client)
- `src/lib/supabase-server.ts` (server client)
- `.env.example` (template)
- `vercel.json` (Vercel config)

**Modified**:
- `prisma/schema.prisma` (SQLite → PostgreSQL)
- `src/lib/db.ts` (removed SQLite adapter)
- `package.json` (removed/added dependencies and scripts)
- UI components (padding/sizing adjustments)

**Not Committed** (in .gitignore):
- `.env.local` (your secrets)
- `node_modules/`
- `.next/`

---

## Success Checklist

- [ ] Supabase project created
- [ ] GitHub repo pushed
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] `setup.sh` ran successfully
- [ ] `.env.local` created and filled
- [ ] `npm run db:push` succeeded
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads
- [ ] Vercel deployment successful
- [ ] Production URL works

---

## Total Setup Time: ~20-30 minutes

- Supabase setup: 5 min
- GitHub setup: 2 min
- Vercel setup: 3 min
- Script execution: 2 min
- Local testing: 5 min
- Deployment: 1 min
- Buffer/troubleshooting: 5-10 min

For detailed troubleshooting and explanations, see `README-setup.md`.

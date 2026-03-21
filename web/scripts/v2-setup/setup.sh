#!/bin/bash

# ============================================================
# AIcata Migration Setup: SQLite → Supabase + Vercel
# ============================================================
# Run this script from the project root (web/) directory
# on the HOST macOS terminal (not in the VM).
#
# Usage: bash scripts/v2-setup/setup.sh
# ============================================================

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  AIcata V2 Setup: SQLite → Supabase + Vercel${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
  echo -e "${RED}❌ Error: This script must be run from the project root (web/) directory${NC}"
  echo -e "${RED}   Expected to find: package.json, prisma/ directory${NC}"
  exit 1
fi

echo -e "${YELLOW}📦 Step 1: Installing new dependencies...${NC}"
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  ai \
  @ai-sdk/anthropic \
  @measured/puck

echo -e "${GREEN}✓ New dependencies installed${NC}\n"

echo -e "${YELLOW}📦 Step 2: Removing SQLite dependencies...${NC}"
npm uninstall \
  @prisma/adapter-better-sqlite3 \
  better-sqlite3

echo -e "${GREEN}✓ SQLite dependencies removed${NC}\n"

echo -e "${YELLOW}📄 Step 3: Creating .env.example...${NC}"
cp scripts/v2-setup/.env.example .env.example
echo -e "${GREEN}✓ .env.example created${NC}"
echo -e "${YELLOW}   → Copy this file to .env.local and fill in your Supabase credentials${NC}\n"

echo -e "${YELLOW}🔨 Step 4: Applying code patches...${NC}"
node scripts/v2-setup/patch-files.js
echo -e "${GREEN}✓ Code patches applied${NC}\n"

echo -e "${YELLOW}📋 Step 5: Running Prisma generate...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}\n"

echo -e "${YELLOW}📝 Step 6: Copying vercel.json...${NC}"
cp scripts/v2-setup/vercel.json ./vercel.json
echo -e "${GREEN}✓ vercel.json created${NC}\n"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📚 Next Steps:${NC}\n"

echo -e "1. ${BLUE}Set up Supabase Project${NC}"
echo -e "   • Go to https://supabase.com and create a new project"
echo -e "   • Copy NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo -e "   • Save to your .env.local file\n"

echo -e "2. ${BLUE}Set up Vercel Project${NC}"
echo -e "   • Push your changes to GitHub (if not already)"
echo -e "   • Go to https://vercel.com/new"
echo -e "   • Import your repository from GitHub"
echo -e "   • Set environment variables in Vercel project settings\n"

echo -e "3. ${BLUE}Run Database Migration${NC}"
echo -e "   • Create a Supabase PostgreSQL database"
echo -e "   • Run migration: ${GREEN}npm run db:push${NC}"
echo -e "   • Or use migration: ${GREEN}npm run db:migrate${NC}\n"

echo -e "4. ${BLUE}Deploy to Vercel${NC}"
echo -e "   • Once environment variables are set, Vercel will deploy automatically"
echo -e "   • Or trigger manually from Vercel dashboard\n"

echo -e "5. ${BLUE}Verify Deployment${NC}"
echo -e "   • Check Vercel logs for any errors"
echo -e "   • Test the app at your production URL\n"

echo -e "${YELLOW}📖 Documentation:${NC}"
echo -e "   • See README-setup.md for detailed Japanese instructions"
echo -e "   • Prisma Studio: ${GREEN}npm run db:studio${NC}\n"

echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "   • Make sure .env.local is in .gitignore (it should be by default)"
echo -e "   • Set environment variables in Vercel project settings"
echo -e "   • Run migrations before deploying to production\n"

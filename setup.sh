#!/bin/bash
# ============================================================
#  BIVALABO 開発環境セットアップスクリプト
#  対象: macOS (Apple Silicon / Intel)
#  実行: ターミナルで  bash setup.sh  を実行
# ============================================================

set -e

# カラー定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                          ║${NC}"
echo -e "${BLUE}║   ${GREEN}BIVALABO 開発環境セットアップ${BLUE}           ║${NC}"
echo -e "${BLUE}║   Shopify App Development Foundation     ║${NC}"
echo -e "${BLUE}║                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ===== ヘルパー関数 =====
step() {
  echo ""
  echo -e "${GREEN}━━━ $1 ━━━${NC}"
}

info() {
  echo -e "${BLUE}  ℹ $1${NC}"
}

success() {
  echo -e "${GREEN}  ✓ $1${NC}"
}

warn() {
  echo -e "${YELLOW}  ⚠ $1${NC}"
}

fail() {
  echo -e "${RED}  ✗ $1${NC}"
}

# ===== 1. Homebrew =====
step "1/8 Homebrew（パッケージマネージャー）"
if command -v brew &>/dev/null; then
  success "Homebrew はインストール済みです ($(brew --version | head -1))"
else
  info "Homebrew をインストールしています..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Apple Silicon の場合 PATH を通す
  if [[ $(uname -m) == "arm64" ]]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
  success "Homebrew をインストールしました"
fi

# ===== 2. Node.js (Volta経由) =====
step "2/8 Node.js 20（Volta経由）"
if command -v volta &>/dev/null; then
  success "Volta はインストール済みです"
else
  info "Volta をインストールしています..."
  curl https://get.volta.sh | bash -s -- --skip-setup
  export VOLTA_HOME="$HOME/.volta"
  export PATH="$VOLTA_HOME/bin:$PATH"

  # シェル設定に追加（まだなければ）
  SHELL_RC="$HOME/.zshrc"
  if ! grep -q "VOLTA_HOME" "$SHELL_RC" 2>/dev/null; then
    echo '' >> "$SHELL_RC"
    echo '# Volta (Node.js version manager)' >> "$SHELL_RC"
    echo 'export VOLTA_HOME="$HOME/.volta"' >> "$SHELL_RC"
    echo 'export PATH="$VOLTA_HOME/bin:$PATH"' >> "$SHELL_RC"
  fi
  success "Volta をインストールしました"
fi

# Node.js のインストール
if command -v node &>/dev/null && [[ "$(node --version)" == v20* ]]; then
  success "Node.js $(node --version) はインストール済みです"
else
  info "Node.js 20 をインストールしています..."
  "$HOME/.volta/bin/volta" install node@20 2>/dev/null || volta install node@20
  success "Node.js $(node --version) をインストールしました"
fi

# ===== 3. Git =====
step "3/8 Git"
if command -v git &>/dev/null; then
  success "Git はインストール済みです ($(git --version))"
else
  info "Git をインストールしています..."
  brew install git
  success "Git をインストールしました"
fi

# Git初期設定（未設定の場合のみ）
if [ -z "$(git config --global user.name)" ]; then
  git config --global user.name "BIVALABO"
  git config --global user.email "nishimura@bivalabo.co.jp"
  success "Git のユーザー情報を設定しました"
fi

# ===== 4. GitHub CLI =====
step "4/8 GitHub CLI"
if command -v gh &>/dev/null; then
  success "GitHub CLI はインストール済みです ($(gh --version | head -1))"
else
  info "GitHub CLI をインストールしています..."
  brew install gh
  success "GitHub CLI をインストールしました"
fi

# ===== 5. Docker Desktop =====
step "5/8 Docker Desktop"
if command -v docker &>/dev/null; then
  success "Docker はインストール済みです ($(docker --version))"
else
  info "Docker Desktop をインストールしています..."
  brew install --cask docker
  warn "Docker Desktop を「アプリケーション」フォルダから一度起動してください"
  warn "初回起動時に権限の許可が必要です"
fi

# ===== 6. VS Code =====
step "6/8 Visual Studio Code"
if command -v code &>/dev/null; then
  success "VS Code はインストール済みです"
else
  if [ -d "/Applications/Visual Studio Code.app" ]; then
    success "VS Code はインストール済みです（code コマンドは未設定）"
    warn "VS Code → Command Palette → 'Shell Command: Install code command' を実行してください"
  else
    info "VS Code をインストールしています..."
    brew install --cask visual-studio-code
    success "VS Code をインストールしました"
  fi
fi

# VS Code 拡張機能
if command -v code &>/dev/null; then
  info "VS Code 拡張機能をインストールしています..."
  code --install-extension dbaeumer.vscode-eslint 2>/dev/null || true
  code --install-extension esbenp.prettier-vscode 2>/dev/null || true
  code --install-extension Prisma.prisma 2>/dev/null || true
  code --install-extension bradlc.vscode-tailwindcss 2>/dev/null || true
  code --install-extension Shopify.theme-check-vscode 2>/dev/null || true
  code --install-extension ms-azuretools.vscode-docker 2>/dev/null || true
  success "VS Code 拡張機能をインストールしました"
fi

# ===== 7. Shopify CLI =====
step "7/8 Shopify CLI"
if command -v shopify &>/dev/null; then
  success "Shopify CLI はインストール済みです ($(shopify version 2>/dev/null || echo 'version check skipped'))"
else
  info "Shopify CLI をインストールしています..."
  npm install -g @shopify/cli@latest
  success "Shopify CLI をインストールしました"
fi

# ===== 8. プロジェクトディレクトリ構造 =====
step "8/8 BIVALABO プロジェクト構造の作成"
PROJECTS_DIR="$HOME/Projects/bivalabo"
mkdir -p "$PROJECTS_DIR"

# .bivalabo 設定ディレクトリ
mkdir -p "$HOME/.bivalabo"

success "プロジェクトディレクトリを作成しました: $PROJECTS_DIR"

# ===== 完了レポート =====
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   セットアップ完了！                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  インストール結果:"
echo ""

check_tool() {
  if command -v "$1" &>/dev/null; then
    success "$2: $(eval "$3" 2>/dev/null || echo 'OK')"
  else
    fail "$2: 未インストール"
  fi
}

check_tool "brew" "Homebrew" "brew --version | head -1"
check_tool "node" "Node.js" "node --version"
check_tool "npm" "npm" "npm --version"
check_tool "git" "Git" "git --version | sed 's/git version //'"
check_tool "gh" "GitHub CLI" "gh --version | head -1 | awk '{print \$3}'"
check_tool "docker" "Docker" "docker --version | sed 's/Docker version //'"
check_tool "shopify" "Shopify CLI" "echo OK"

echo ""
if command -v code &>/dev/null; then
  success "VS Code: インストール済み"
elif [ -d "/Applications/Visual Studio Code.app" ]; then
  warn "VS Code: アプリはあるが code コマンド未設定"
else
  fail "VS Code: 未インストール"
fi

echo ""
echo -e "${BLUE}━━━ 次のステップ ━━━${NC}"
echo ""
echo "  1. ターミナルを一度閉じて開き直す（PATH設定の反映）"
echo "  2. Docker Desktop をアプリケーションから起動"
echo "  3. gh auth login でGitHubにログイン"
echo ""
echo -e "${BLUE}  準備ができたら、Claudeに「次へ進もう」と伝えてください${NC}"
echo ""

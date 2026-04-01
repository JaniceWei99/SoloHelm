#!/usr/bin/env bash
# ============================================================================
# SoloHelm — macOS One-click Installer (double-click to run)
# ============================================================================
set -euo pipefail

# cd to the folder where this script lives (the project root)
cd "$(dirname "$0")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[ OK ]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERR]${NC}  $*"; }

PORT="${PORT:-3000}"
NODE_MIN=16

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     SoloHelm Installer (macOS)       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ---- Step 1: Check / install Node.js ----
if command -v node &>/dev/null; then
  NODE_VER="$(node -v | sed 's/^v//')"
  NODE_MAJOR="${NODE_VER%%.*}"
  if [ "$NODE_MAJOR" -ge "$NODE_MIN" ]; then
    ok "Node.js v${NODE_VER} detected"
  else
    warn "Node.js v${NODE_VER} too old (need >= ${NODE_MIN})"
    NEED_NODE=1
  fi
else
  warn "Node.js not found"
  NEED_NODE=1
fi

if [ "${NEED_NODE:-}" = "1" ]; then
  info "Installing Node.js ..."

  if command -v brew &>/dev/null; then
    info "Using Homebrew to install Node.js 20 ..."
    brew install node@20
    brew link --overwrite node@20 2>/dev/null || true
  else
    info "Homebrew not found. Installing Homebrew first ..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add brew to PATH for Apple Silicon and Intel
    if [ -f /opt/homebrew/bin/brew ]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -f /usr/local/bin/brew ]; then
      eval "$(/usr/local/bin/brew shellenv)"
    fi

    brew install node@20
    brew link --overwrite node@20 2>/dev/null || true
  fi

  if command -v node &>/dev/null; then
    ok "Node.js $(node -v) installed"
  else
    err "Failed to install Node.js"
    err "Please install manually: https://nodejs.org"
    echo ""
    echo "Press any key to exit ..."
    read -n1 -s
    exit 1
  fi
fi

# ---- Step 2: Install dependencies ----
info "Installing dependencies (npm install) ..."
npm install
ok "Dependencies installed"

# ---- Step 3: Start server ----
echo ""
ok "============================================"
ok "  SoloHelm is starting!"
ok "  Open browser: http://localhost:${PORT}"
ok "  Press Ctrl+C to stop the server"
ok "============================================"
echo ""

# Open browser automatically
sleep 1 && open "http://localhost:${PORT}" &

PORT="$PORT" node server.js

# Keep terminal window open if server exits
echo ""
echo "Server stopped. Press any key to close ..."
read -n1 -s

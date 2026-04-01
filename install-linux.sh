#!/usr/bin/env bash
# ============================================================================
# SoloHelm — One-click Install & Deploy Script
# Usage:
#   bash install.sh              # Install dependencies + start (foreground)
#   bash install.sh --service    # Install + register as systemd service
#   bash install.sh --docker     # Build & run via Docker
#   bash install.sh --uninstall  # Remove systemd service
# ============================================================================
set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ---- Config ----
APP_NAME="solohelm"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-3000}"
NODE_MIN_VERSION=16
SERVICE_FILE="/etc/systemd/system/${APP_NAME}.service"

# ---- Helpers ----
command_exists() { command -v "$1" &>/dev/null; }

version_ge() {
  # Returns 0 if $1 >= $2 (major version comparison)
  [ "$(echo -e "$1\n$2" | sort -V | head -n1)" = "$2" ]
}

detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_ID="${ID:-unknown}"
    OS_LIKE="${ID_LIKE:-$OS_ID}"
  elif command_exists sw_vers; then
    OS_ID="macos"
    OS_LIKE="macos"
  else
    OS_ID="unknown"
    OS_LIKE="unknown"
  fi
}

# ---- Install Node.js ----
install_node() {
  info "Installing Node.js 20.x ..."

  case "$OS_ID" in
    ubuntu|debian|pop|linuxmint)
      install_node_deb
      ;;
    centos|rhel|fedora|rocky|almalinux|amzn)
      install_node_rpm
      ;;
    alpine)
      sudo apk add --no-cache nodejs npm
      ;;
    arch|manjaro)
      sudo pacman -Sy --noconfirm nodejs npm
      ;;
    macos)
      if command_exists brew; then
        brew install node@20
      else
        err "Please install Homebrew first: https://brew.sh"
        exit 1
      fi
      ;;
    *)
      # Fallback: try ID_LIKE
      case "$OS_LIKE" in
        *debian*|*ubuntu*) install_node_deb ;;
        *rhel*|*fedora*)   install_node_rpm ;;
        *)
          err "Unsupported OS: $OS_ID. Please install Node.js >= $NODE_MIN_VERSION manually."
          err "https://nodejs.org/en/download"
          exit 1
          ;;
      esac
      ;;
  esac
}

install_node_deb() {
  sudo apt-get update -qq
  sudo apt-get install -y -qq ca-certificates curl gnupg
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -qq nodejs
}

install_node_rpm() {
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  if command_exists dnf; then
    sudo dnf install -y nodejs
  else
    sudo yum install -y nodejs
  fi
}

# ---- Check / install Node.js ----
ensure_node() {
  if command_exists node; then
    NODE_VER="$(node -v | sed 's/^v//')"
    NODE_MAJOR="${NODE_VER%%.*}"
    if [ "$NODE_MAJOR" -ge "$NODE_MIN_VERSION" ]; then
      ok "Node.js v${NODE_VER} detected"
      return
    else
      warn "Node.js v${NODE_VER} is below minimum v${NODE_MIN_VERSION}"
    fi
  else
    warn "Node.js not found"
  fi

  detect_os
  info "Detected OS: $OS_ID"
  install_node

  if command_exists node; then
    ok "Node.js $(node -v) installed successfully"
  else
    err "Failed to install Node.js. Please install manually: https://nodejs.org"
    exit 1
  fi
}

# ---- Install npm dependencies ----
install_deps() {
  info "Installing npm dependencies ..."
  cd "$APP_DIR"

  # Use China mirror if in China (detect by locale or env)
  if [ "${NPM_MIRROR:-}" = "cn" ]; then
    npm install --registry=https://registry.npmmirror.com
  else
    npm install
  fi

  ok "Dependencies installed"
}

# ---- Docker mode ----
run_docker() {
  if ! command_exists docker; then
    err "Docker not found. Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
  fi

  info "Building Docker image ..."
  cd "$APP_DIR"
  docker build -t "${APP_NAME}:latest" .
  ok "Docker image built"

  # Stop existing container if running
  if docker ps -a --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
    info "Removing existing container ..."
    docker rm -f "$APP_NAME" >/dev/null
  fi

  info "Starting Docker container on port ${PORT} ..."
  docker run -d \
    --name "$APP_NAME" \
    -p "${PORT}:${PORT}" \
    -e "PORT=${PORT}" \
    -v "${APP_NAME}-data:/app/data" \
    --restart unless-stopped \
    "${APP_NAME}:latest"

  ok "SoloHelm is running at http://localhost:${PORT}"
  info "Manage with: docker logs -f ${APP_NAME} | docker stop ${APP_NAME} | docker start ${APP_NAME}"
}

# ---- systemd service mode ----
install_service() {
  if [ "$(uname)" = "Darwin" ]; then
    err "systemd is not available on macOS. Use 'pm2' instead or run without --service."
    exit 1
  fi

  if ! command_exists systemctl; then
    err "systemd not found. Please use 'bash install.sh' to run in foreground."
    exit 1
  fi

  ensure_node
  install_deps

  info "Creating systemd service ..."
  NODE_PATH="$(command -v node)"
  CURRENT_USER="$(whoami)"

  sudo tee "$SERVICE_FILE" >/dev/null <<UNIT
[Unit]
Description=SoloHelm Task Board
After=network.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${APP_DIR}
ExecStart=${NODE_PATH} server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=${PORT}

[Install]
WantedBy=multi-user.target
UNIT

  sudo systemctl daemon-reload
  sudo systemctl enable "$APP_NAME"
  sudo systemctl start "$APP_NAME"

  ok "SoloHelm service installed and started"
  ok "Access at http://localhost:${PORT}"
  echo ""
  info "Service commands:"
  info "  sudo systemctl status  ${APP_NAME}"
  info "  sudo systemctl stop    ${APP_NAME}"
  info "  sudo systemctl start   ${APP_NAME}"
  info "  sudo systemctl restart ${APP_NAME}"
  info "  sudo journalctl -u ${APP_NAME} -f    # view logs"
}

# ---- Uninstall service ----
uninstall_service() {
  if [ ! -f "$SERVICE_FILE" ]; then
    warn "Service not found, nothing to uninstall."
    return
  fi

  info "Stopping and removing ${APP_NAME} service ..."
  sudo systemctl stop "$APP_NAME" 2>/dev/null || true
  sudo systemctl disable "$APP_NAME" 2>/dev/null || true
  sudo rm -f "$SERVICE_FILE"
  sudo systemctl daemon-reload

  ok "Service uninstalled. Project files are still in: ${APP_DIR}"
}

# ---- Foreground run ----
run_foreground() {
  ensure_node
  install_deps

  echo ""
  ok "============================================"
  ok "  SoloHelm is starting on port ${PORT}"
  ok "  Open: http://localhost:${PORT}"
  ok "  Press Ctrl+C to stop"
  ok "============================================"
  echo ""

  cd "$APP_DIR"
  PORT="$PORT" NODE_ENV=production node server.js
}

# ---- Print help ----
print_help() {
  cat <<'HELP'
SoloHelm — One-click Install & Deploy

Usage:
  bash install.sh              Install deps + start server (foreground)
  bash install.sh --service    Install deps + register as systemd service
  bash install.sh --docker     Build & run via Docker container
  bash install.sh --uninstall  Remove systemd service
  bash install.sh --help       Show this help

Environment variables:
  PORT=8080 bash install.sh    Use custom port (default: 3000)
  NPM_MIRROR=cn bash install.sh  Use China npm mirror

Examples:
  # Quick start
  bash install.sh

  # Custom port
  PORT=8080 bash install.sh

  # China mirror + systemd service
  NPM_MIRROR=cn bash install.sh --service

  # Docker deployment
  bash install.sh --docker
HELP
}

# ---- Main ----
echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     SoloHelm Installer v1.0.0        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

case "${1:-}" in
  --service)   install_service ;;
  --docker)    run_docker ;;
  --uninstall) uninstall_service ;;
  --help|-h)   print_help ;;
  "")          run_foreground ;;
  *)
    err "Unknown option: $1"
    print_help
    exit 1
    ;;
esac

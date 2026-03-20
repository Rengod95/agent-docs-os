#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG_DIR="$(dirname "$SCRIPT_DIR")"

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_banner() {
  echo ""
  echo -e "${BOLD}─────────────────────────────────${NC}"
  echo -e "${BOLD}  Agent Docs OS Initializer${NC}"
  echo -e "${BOLD}─────────────────────────────────${NC}"
  echo ""
}

# ─── Check if running via npx (package context) or standalone ───
TEMPLATES_DIR=""
if [ -d "$PKG_DIR/templates" ]; then
  TEMPLATES_DIR="$PKG_DIR/templates"
elif [ -d "$SCRIPT_DIR/../templates" ]; then
  TEMPLATES_DIR="$SCRIPT_DIR/../templates"
fi

print_banner

# ─── Try Node.js handoff (skip with --shell-only) ───
SHELL_ONLY=false
for arg in "$@"; do
  [ "$arg" = "--shell-only" ] && SHELL_ONLY=true
done

if [ "$SHELL_ONLY" = false ] && command -v node &>/dev/null; then
  if [ -f "$PKG_DIR/src/onboard.mjs" ]; then
    exec node "$PKG_DIR/src/onboard.mjs" "$@"
  fi
fi

# ─── Fallback: basic shell-only init ───
echo -e "${CYAN}Node.js not found. Running basic shell init.${NC}"
echo ""

# Parse positional arg (skip flags)
DOCS_DIR="agent_docs"
for arg in "$@"; do
  case "$arg" in --*) ;; *) DOCS_DIR="$arg"; break ;; esac
done

if [ -z "$TEMPLATES_DIR" ]; then
  echo -e "${RED}Error: templates directory not found.${NC}"
  echo "If running standalone, ensure templates/ is next to this script."
  exit 1
fi

TARGET_DIR="$(pwd)/$DOCS_DIR"

if [ -d "$TARGET_DIR" ]; then
  echo -e "${RED}Error: $DOCS_DIR/ already exists.${NC}"
  exit 1
fi

echo -e "Creating ${BOLD}$DOCS_DIR/${NC} ..."
cp -r "$TEMPLATES_DIR" "$TARGET_DIR"

# Create workspace README placeholder
if [ -d "$TARGET_DIR/features/_feature-template/workspace" ]; then
  echo "# Workspace" > "$TARGET_DIR/features/_feature-template/workspace/README.md"
  echo "" >> "$TARGET_DIR/features/_feature-template/workspace/README.md"
  echo "Free-form working documents for this feature." >> "$TARGET_DIR/features/_feature-template/workspace/README.md"
fi

# Create archive README placeholder
if [ -d "$TARGET_DIR/features/_feature-template/archive" ]; then
  echo "# Archive" > "$TARGET_DIR/features/_feature-template/archive/README.md"
  echo "" >> "$TARGET_DIR/features/_feature-template/archive/README.md"
  echo "Archived current.md snapshots." >> "$TARGET_DIR/features/_feature-template/archive/README.md"
fi

# Write scaffold version
echo "1.0.0" > "$TARGET_DIR/.scaffold-version"

echo ""
echo -e "${GREEN}✓${NC} $DOCS_DIR/ structure created"
echo -e "${GREEN}✓${NC} Scaffold version: v1.0.0"
echo ""
echo -e "${CYAN}Note:${NC} For interactive onboarding (agent selection, bootstrap injection),"
echo "      install Node.js and run: npx agent-docs-init"
echo ""

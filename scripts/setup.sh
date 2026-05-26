#!/usr/bin/env bash
set -euo pipefail

# First-time setup for the Strapi community hub monorepo.
# Idempotent: safe to re-run.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== Strapi community hub setup ==="
echo ""

# -----------------------------------------------------------------------------
# 1. Dependencies
# -----------------------------------------------------------------------------
echo "-> Installing workspace dependencies (pnpm install)..."
pnpm install
echo ""

# -----------------------------------------------------------------------------
# 2. Seed .env files from .env.example
# -----------------------------------------------------------------------------
echo "-> Checking .env files..."

seed_env() {
  local dir="$1"
  if [[ ! -f "$dir/.env.example" ]]; then
    return
  fi
  if [[ -f "$dir/.env" ]]; then
    echo "   $dir/.env already exists — skipped"
    return
  fi
  cp "$dir/.env.example" "$dir/.env"
  echo "   $dir/.env created from .env.example"
}

for dir in apps/cms apps/web apps/automation; do
  seed_env "$dir"
done
echo ""

# -----------------------------------------------------------------------------
# 3. Warn about placeholder secrets
# -----------------------------------------------------------------------------
echo "-> Checking for placeholder values..."
placeholder_found=0
while IFS= read -r -d '' env_file; do
  if grep -Eq '(^|=)(tobemodified|toBeModified)' "$env_file" 2>/dev/null; then
    echo "   !! $env_file has placeholder values — set real secrets before 'pnpm dev'"
    placeholder_found=1
  fi
done < <(find apps -maxdepth 2 -name .env -not -path "*/node_modules/*" -print0)

if [[ "$placeholder_found" -eq 0 ]]; then
  echo "   no placeholder values detected"
fi
echo ""

# -----------------------------------------------------------------------------
# 4. Compose engine check (informational)
# -----------------------------------------------------------------------------
echo "-> Checking container engine..."
if command -v podman-compose >/dev/null 2>&1 && command -v podman >/dev/null 2>&1; then
  echo "   podman-compose found"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "   docker compose (v2 plugin) found"
elif command -v docker-compose >/dev/null 2>&1; then
  echo "   docker-compose found"
else
  echo "   !! no compose engine detected — install Docker Desktop or podman-compose"
fi
echo ""

# -----------------------------------------------------------------------------
# 5. inotify instance limit (Linux only) — Turbopack needs many watchers
# -----------------------------------------------------------------------------
if [[ "$(uname)" == "Linux" ]]; then
  echo "-> Checking inotify limits..."
  INSTANCES_FILE=/proc/sys/fs/inotify/max_user_instances
  if [[ -r "$INSTANCES_FILE" ]]; then
    INSTANCES=$(cat "$INSTANCES_FILE")
    if [[ "$INSTANCES" -lt 256 ]]; then
      cat <<EOF
   !! fs.inotify.max_user_instances = $INSTANCES (too low for Turbopack / Next.js watchers)
      Next.js dev will crash with "Too many open files (os error 24)".
      Temporary:  sudo sysctl -w fs.inotify.max_user_instances=512
      Permanent:  echo 'fs.inotify.max_user_instances=512' | sudo tee -a /etc/sysctl.conf
                  sudo sysctl -p
EOF
    else
      echo "   fs.inotify.max_user_instances = $INSTANCES (ok)"
    fi
  fi
  echo ""
fi

# -----------------------------------------------------------------------------
# Next steps
# -----------------------------------------------------------------------------
cat <<'EOF'
=== Setup complete ===

Next:
  - Fill any placeholder secrets flagged above in apps/*/.env
  - pnpm dev           # start everything (n8n + meilisearch detached; cms + web in foreground)
  - pnpm n8n:start     # just the automation stack
  - pnpm search:start  # just the meilisearch stack

(Re-run this setup anytime with `pnpm bootstrap`.)
EOF

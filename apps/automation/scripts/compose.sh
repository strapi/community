#!/usr/bin/env bash
set -euo pipefail

# Engine-agnostic compose wrapper. Resolves compose file relative to this script
# so it works regardless of the caller's CWD.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/../docker-compose.yml"

resolve_engine() {
  if command -v podman-compose >/dev/null 2>&1 && command -v podman >/dev/null 2>&1; then
    echo "podman-compose"
    return
  fi
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return
  fi
  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return
  fi
  cat >&2 <<'EOF'
Error: no compose engine found.

Install one of:
  - Docker Desktop (includes the "docker compose" v2 plugin)
  - Podman + podman-compose:
      pip install --user podman-compose
EOF
  exit 1
}

ENGINE="$(resolve_engine)"

# shellcheck disable=SC2086
exec $ENGINE -f "$COMPOSE_FILE" "$@"

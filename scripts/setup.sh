#!/usr/bin/env bash
#
# ORVIX — One-command setup (clean checkout)
#
# This script:
#   1. Verifies prerequisites (node, pnpm, git)
#   2. Installs all dependencies via pnpm workspaces
#   3. Copies .env.example to apps/web/.env.local if not present
#   4. (Optionally) pushes the Prisma schema and installs uuid_generate_v7()
#   5. Runs the four gates (typecheck, test, lint, build)
#
# Usage:
#   ./scripts/setup.sh                    # install + verify
#   ./scripts/setup.sh --with-db          # also apply schema
#   DATABASE_URL=postgres://... ./scripts/setup.sh --with-db
#
set -euo pipefail

WITH_DB=0
for arg in "$@"; do
  case "$arg" in
    --with-db) WITH_DB=1 ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "→ ORVIX setup starting in $ROOT"

# 1. Verify prerequisites
echo
echo "→ Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "  ✗ node not found" >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "  ✗ pnpm not found. Run: corepack enable" >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "  ✗ git not found" >&2; exit 1; }
NODE_MAJOR=$(node -p "parseInt(process.versions.node.split('.')[0], 10)")
[[ "$NODE_MAJOR" -ge 20 ]] || { echo "  ✗ Node 20+ required (found $NODE_MAJOR)" >&2; exit 1; }
echo "  ✓ node $(node --version), pnpm $(pnpm --version), git $(git --version | awk '{print $3}')"

# 2. Install dependencies
echo
echo "→ Installing dependencies (this can take 3-5 min on a fresh checkout)..."
pnpm install --prefer-offline

# 3. Create .env.local if missing
ENV_FILE="$ROOT/apps/web/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo
  echo "→ Creating apps/web/.env.local from .env.example..."
  cp "$ROOT/apps/web/.env.example" "$ENV_FILE" 2>/dev/null || cat > "$ENV_FILE" <<'EOF'
# ORVIX — local dev environment

# Database (required for production; optional for in-memory dev)
# DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB?sslmode=require
# ORVIX_DB_BACKEND=prisma

# Auth
# AUTH_SECRET=replace-with-openssl-rand-base64-32
# EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
# EMAIL_FROM=noreply@orvix.app
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# MICROSOFT_CLIENT_ID=
# MICROSOFT_CLIENT_SECRET=
# MICROSOFT_ISSUER=https://login.microsoftonline.com/common/v2.0

# Storage
# ORVIX_S3_BUCKET=
# ORVIX_S3_ENDPOINT=
# ORVIX_S3_REGION=auto
# ORVIX_S3_ACCESS_KEY_ID=
# ORVIX_S3_SECRET_ACCESS_KEY=
# ORVIX_S3_FORCE_PATH_STYLE=1

# AI providers (at least one)
# ORVIX_AI_DEFAULT_PROVIDER=openai
# ORVIX_OPENAI_API_KEY=
# ORVIX_ANTHROPIC_API_KEY=
# ORVIX_GEMINI_API_KEY=
# ORVIX_OPENROUTER_API_KEY=
# ORVIX_OLLAMA_BASE_URL=http://127.0.0.1:11434

# Dev-only API routes
ORVIX_ALLOW_DEV_BOOTSTRAP=1
EOF
  echo "  ✓ Created $ENV_FILE"
else
  echo "  ✓ $ENV_FILE already exists (preserved)"
fi

# 4. Optionally apply the schema
if [[ "$WITH_DB" -eq 1 ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo
    echo "→ --with-db requested but DATABASE_URL is not set. Skipping schema push."
    echo "  Set DATABASE_URL and re-run, or apply manually:"
    echo "    cd packages/db && npx prisma db push --schema=src/schema.prisma"
  else
    echo
    echo "→ Applying Prisma schema to $DATABASE_URL..."
    cd "$ROOT/packages/db"
    npx prisma db push --schema=src/schema.prisma --skip-generate || true
    echo "  → Installing uuid_generate_v7()..."
    node scripts/install-v7.cjs
    echo "  → Re-applying schema (function is now available)..."
    npx prisma db push --schema=src/schema.prisma --skip-generate
    echo "  → Re-installing uuid_generate_v7() in case push dropped it..."
    node scripts/install-v7.cjs
    cd "$ROOT"
  fi
fi

# 5. Run the four gates
echo
echo "→ Running gates: typecheck, test, lint, build..."
pnpm -r typecheck
pnpm -r test
pnpm -r lint
pnpm -r build

echo
echo "✓ ORVIX setup complete."
echo
echo "Next steps:"
echo "  • Dev server:    cd apps/web && pnpm dev   (or: ./scripts/dev.sh)"
echo "  • AI service:    cd apps/ai && pnpm dev    (in another terminal)"
echo "  • Browse:        http://localhost:3000"
echo "  • Seed workspace: POST /api/dev/bootstrap + /api/dev/seed"
echo "  • Docs:          docs/PHASE-0-STATUS.md, docs/MILESTONE-1-STATUS.md"

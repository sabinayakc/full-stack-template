#!/usr/bin/env bash
set -euo pipefail

# Deploy the Hono API server to Cloudflare Workers.
# Usage: ./deploy-server.sh [staging|production]

ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$ROOT_DIR/apps/server"

echo "==> Building server..."
cd "$ROOT_DIR"
pnpm --filter @repo/server build

echo "==> Deploying to Cloudflare Workers ($ENVIRONMENT)..."
cd "$SERVER_DIR"

if [ "$ENVIRONMENT" = "staging" ]; then
  npx wrangler deploy --env staging
else
  npx wrangler deploy
fi

echo "==> Server deployed successfully."

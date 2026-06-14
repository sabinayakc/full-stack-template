#!/usr/bin/env bash
set -euo pipefail

# Deploy the Expo web export to Cloudflare Pages.
# Usage: ./deploy-web.sh [staging|production]

ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Pages project name matches tofu output
if [ "$ENVIRONMENT" = "staging" ]; then
  PROJECT_NAME="app-staging-web"
  BRANCH="staging"
else
  PROJECT_NAME="app-production-web"
  BRANCH="main"
fi

echo "==> Exporting Expo web build..."
cd "$ROOT_DIR"
pnpm --filter @repo/client exec expo export --platform web

echo "==> Deploying to Cloudflare Pages ($ENVIRONMENT)..."
npx wrangler pages deploy apps/client/dist \
  --project-name "$PROJECT_NAME" \
  --branch "$BRANCH"

echo "==> Web app deployed successfully."

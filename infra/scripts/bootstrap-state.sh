#!/usr/bin/env bash
set -euo pipefail

# Bootstrap the R2 bucket used for OpenTofu remote state.
# Idempotent — safe to run multiple times.
#
# Reads from environment (source infra/.env first):
#   CLOUDFLARE_ACCOUNT_ID  — required
#   CLOUDFLARE_API_TOKEN   — required (used by npx wrangler)
#
# Usage: source infra/.env && ./infra/scripts/bootstrap-state.sh

BUCKET_NAME="app-tfstate"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VERSIONS_FILE="$SCRIPT_DIR/../tofu/versions.tf"

# ─── Validate env vars ───────────────────────────────────────────────────────

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "Error: CLOUDFLARE_ACCOUNT_ID is not set."
  echo "Run: source infra/.env"
  exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN is not set."
  echo "Run: source infra/.env"
  exit 1
fi

ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID"

# ─── 1. Ensure R2 bucket exists ──────────────────────────────────────────────

echo "==> Checking R2 bucket '$BUCKET_NAME'..."
if npx wrangler r2 bucket list 2>/dev/null | grep -q "\"$BUCKET_NAME\""; then
  echo "    Bucket already exists."
else
  echo "    Creating bucket..."
  npx wrangler r2 bucket create "$BUCKET_NAME"
  echo "    Bucket created."
fi

# ─── 2. Uncomment backend block and inject account ID in versions.tf ─────────

echo "==> Updating versions.tf backend config..."
if grep -q '# backend "s3"' "$VERSIONS_FILE"; then
  # Uncomment the backend block
  sed -i.bak \
    -e 's|^  # backend "s3" {|  backend "s3" {|' \
    -e 's|^  #   bucket |    bucket |' \
    -e 's|^  #   key |    key |' \
    -e 's|^  #   region |    region |' \
    -e 's|^  #   skip_credentials_validation |    skip_credentials_validation |' \
    -e 's|^  #   skip_metadata_api_check |    skip_metadata_api_check |' \
    -e 's|^  #   skip_region_validation |    skip_region_validation |' \
    -e 's|^  #   skip_requesting_account_id |    skip_requesting_account_id |' \
    -e 's|^  #   use_path_style |    use_path_style |' \
    -e 's|^  #   endpoints = {|    endpoints = {|' \
    -e "s|^  #     s3 = \"https://<ACCOUNT_ID>|      s3 = \"https://${ACCOUNT_ID}|" \
    -e 's|^  #   }|    }|' \
    -e 's|^  # }|  }|' \
    "$VERSIONS_FILE"
  rm -f "$VERSIONS_FILE.bak"
  echo "    Backend block uncommented and account ID set."
elif grep -q '<ACCOUNT_ID>' "$VERSIONS_FILE"; then
  sed -i.bak "s|<ACCOUNT_ID>|${ACCOUNT_ID}|g" "$VERSIONS_FILE"
  rm -f "$VERSIONS_FILE.bak"
  echo "    Account ID updated."
else
  echo "    Backend already configured."
fi

# ─── 3. Print next steps ─────────────────────────────────────────────────────

echo ""
echo "==> Next steps:"
echo ""
echo "  1. If you haven't already, create an R2 API token:"
echo "     Dashboard → R2 → Manage R2 API Tokens → Create API Token"
echo "     Permissions: Object Read & Write on bucket '$BUCKET_NAME'"
echo "     Then set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in infra/.env"
echo ""
echo "  2. Initialize tofu:"
echo "     source infra/.env"
echo "     cd infra/tofu"
echo "     tofu init"
echo "     tofu workspace new staging"
echo "     tofu workspace new production"
echo ""
echo "Done."

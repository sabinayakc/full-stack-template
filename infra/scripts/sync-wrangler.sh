#!/usr/bin/env bash
set -euo pipefail

# Syncs resource IDs from OpenTofu outputs into apps/server/wrangler.toml.
# Run this after `tofu apply` to populate binding IDs.
#
# Usage: ./sync-wrangler.sh [staging|production]

ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOFU_DIR="$SCRIPT_DIR/../tofu"
WRANGLER_FILE="$SCRIPT_DIR/../../apps/server/wrangler.toml"

echo "==> Reading tofu outputs for $ENVIRONMENT..."
cd "$TOFU_DIR"

KV_ID=$(tofu output -raw kv_namespace_id)
R2_BUCKET=$(tofu output -raw r2_bucket_name)
HYPERDRIVE_ID=$(tofu output -raw hyperdrive_id)
QUEUE_NAME=$(tofu output -raw queue_name)
DLQ_NAME=$(tofu output -raw dlq_name)

echo "    KV namespace:  $KV_ID"
echo "    R2 bucket:     $R2_BUCKET"
echo "    Hyperdrive:    $HYPERDRIVE_ID"
echo "    Queue:         $QUEUE_NAME"
echo "    DLQ:           $DLQ_NAME"

if [ "$ENVIRONMENT" = "dev" ]; then
  # Update dev bindings
  sed -i.bak \
    -e "/\[\[env\.dev\.kv_namespaces\]\]/{n;s/^binding = \"KV\"/binding = \"KV\"/;n;s/^id = .*/id = \"$KV_ID\"/;}" \
    -e "/\[\[env\.dev\.r2_buckets\]\]/{n;s/^binding = \"R2\"/binding = \"R2\"/;n;s/^bucket_name = .*/bucket_name = \"$R2_BUCKET\"/;}" \
    -e "/\[\[env\.dev\.hyperdrive\]\]/{n;s/^binding = \"HYPERDRIVE\"/binding = \"HYPERDRIVE\"/;n;s/^id = .*/id = \"$HYPERDRIVE_ID\"/;}" \
    -e "s/^queue = \"app-dev-jobs\"/queue = \"$QUEUE_NAME\"/g" \
    -e "s/^dead_letter_queue = \"app-dev-jobs-dlq\"/dead_letter_queue = \"$DLQ_NAME\"/g" \
    "$WRANGLER_FILE"
else
  # Update production bindings (top-level, before [env.*] sections)
  sed -i.bak \
    -e "/^\[\[kv_namespaces\]\]/{n;s/^binding = \"KV\"/binding = \"KV\"/;n;s/^id = .*/id = \"$KV_ID\"/;}" \
    -e "/^\[\[r2_buckets\]\]/{n;s/^binding = \"R2\"/binding = \"R2\"/;n;s/^bucket_name = .*/bucket_name = \"$R2_BUCKET\"/;}" \
    -e "/^\[\[hyperdrive\]\]/{n;s/^binding = \"HYPERDRIVE\"/binding = \"HYPERDRIVE\"/;n;s/^id = .*/id = \"$HYPERDRIVE_ID\"/;}" \
    -e "s/^queue = \"app-production-jobs\"/queue = \"$QUEUE_NAME\"/g" \
    -e "s/^dead_letter_queue = \"app-production-jobs-dlq\"/dead_letter_queue = \"$DLQ_NAME\"/g" \
    "$WRANGLER_FILE"
fi

rm -f "$WRANGLER_FILE.bak"
echo "==> wrangler.toml updated."

# ─── Neon ─────────────────────────────────────────────────────────────────────

output "database_url" {
  description = "Neon PostgreSQL connection string (pooled)"
  value       = module.neon.connection_uri
  sensitive   = true
}

output "neon_project_id" {
  description = "Neon project ID"
  value       = module.neon.project_id
}

# ─── Cloudflare ───────────────────────────────────────────────────────────────

output "zone_id" {
  description = "Cloudflare zone ID"
  value       = module.dns.zone_id
}

output "kv_namespace_id" {
  description = "KV namespace ID for wrangler.toml binding"
  value       = module.kv.namespace_id
}

output "r2_bucket_name" {
  description = "R2 bucket name"
  value       = module.r2.bucket_name
}

output "hyperdrive_id" {
  description = "Hyperdrive config ID for wrangler.toml binding"
  value       = module.hyperdrive.config_id
}

# ─── Queue ────────────────────────────────────────────────────────────────────

output "queue_name" {
  description = "Queue name for wrangler.toml binding"
  value       = module.queue.queue_name
}

output "dlq_name" {
  description = "Dead-letter queue name"
  value       = module.queue.dlq_name
}

# ─── Turnstile ───────────────────────────────────────────────────────────────

output "turnstile_site_key" {
  description = "Turnstile site key (public, for client widget)"
  value       = module.turnstile.site_key
}

output "turnstile_secret_key" {
  description = "Turnstile secret key (for server-side verification)"
  value       = module.turnstile.secret_key
  sensitive   = true
}


output "namespace_id" {
  description = "KV namespace ID (use in wrangler.toml bindings)"
  value       = cloudflare_workers_kv_namespace.this.id
}

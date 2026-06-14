output "config_id" {
  description = "Hyperdrive config ID (use in wrangler.toml bindings)"
  value       = cloudflare_hyperdrive_config.this.id
}

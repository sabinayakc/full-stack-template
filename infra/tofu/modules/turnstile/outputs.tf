output "site_key" {
  description = "Turnstile site key (public, used in client-side widget)"
  value       = cloudflare_turnstile_widget.this.sitekey
}

output "secret_key" {
  description = "Turnstile secret key (private, used for server-side verification)"
  value       = cloudflare_turnstile_widget.this.secret
  sensitive   = true
}

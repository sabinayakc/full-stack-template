data "cloudflare_zone" "this" {
  filter = {
    account = {
      id = var.account_id
    }
    name = var.domain
  }
}

# DNS records for subdomains are managed by cloudflare_workers_custom_domain
# in the worker module. This module only provides the zone_id lookup.

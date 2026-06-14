locals {
  environment = terraform.workspace # "dev" or "production"
  prefix      = "${var.project_name}-${local.environment}"
  is_prod     = local.environment == "production"
}

# ─── Providers ────────────────────────────────────────────────────────────────

provider "cloudflare" {
  # Reads CLOUDFLARE_API_TOKEN from env
}

provider "neon" {
}

# ─── Neon PostgreSQL ──────────────────────────────────────────────────────────

module "neon" {
  source = "./modules/neon"

  project_name              = local.prefix
  region                    = var.neon_region
  pg_version                = var.neon_pg_version
  org_id                    = var.neon_org_id
  history_retention_seconds = local.is_prod ? 604800 : 86400 # 7d prod, 1d dev
}

# ─── Cloudflare DNS ───────────────────────────────────────────────────────────
# Zone lookup only — DNS records for subdomains are managed by Workers custom domains.

module "dns" {
  source = "./modules/dns"

  domain     = var.domain
  account_id = var.cloudflare_account_id
}

# ─── Cloudflare KV ────────────────────────────────────────────────────────────

module "kv" {
  source = "./modules/kv"

  account_id = var.cloudflare_account_id
  namespace  = "${local.prefix}-cache"
}

# ─── Cloudflare R2 ────────────────────────────────────────────────────────────

module "r2" {
  source = "./modules/r2"

  account_id  = var.cloudflare_account_id
  bucket_name = "${local.prefix}-storage"
}

# ─── Cloudflare Hyperdrive ────────────────────────────────────────────────────

module "hyperdrive" {
  source = "./modules/hyperdrive"

  account_id      = var.cloudflare_account_id
  name            = "${local.prefix}-db"
  origin_host     = module.neon.host
  origin_database = module.neon.database
  origin_user     = module.neon.user
  origin_password = module.neon.password
}

# ─── Cloudflare Turnstile ─────────────────────────────────────────────────────

module "turnstile" {
  source = "./modules/turnstile"

  account_id = var.cloudflare_account_id
  name       = "${local.prefix}-captcha"
  domains    = local.is_prod ? [var.domain, "app.${var.domain}"] : ["app-dev.${var.domain}", "localhost"]
  mode       = "managed"
}

# ─── Cloudflare Queue ─────────────────────────────────────────────────────────

module "queue" {
  source = "./modules/queue"

  account_id = var.cloudflare_account_id
  queue_name = "${local.prefix}-jobs"
}

# ─── Cloudflare Worker ───────────────────────────────────────────────────────
# Worker code + custom domains are managed by wrangler.toml (no tofu dependency).

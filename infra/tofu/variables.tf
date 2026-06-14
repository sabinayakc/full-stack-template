# Environment is determined by workspace: `tofu workspace select staging`

# ─── General ──────────────────────────────────────────────────────────────────

variable "project_name" {
  description = "Project name used as prefix for resources"
  type        = string
  default     = "app"
}

# ─── Cloudflare ───────────────────────────────────────────────────────────────

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Root domain managed in Cloudflare (e.g. example.com)"
  type        = string
}

# ─── Neon ─────────────────────────────────────────────────────────────────────

variable "neon_region" {
  description = "Neon project region"
  type        = string
  default     = "aws-us-east-1"
}

variable "neon_pg_version" {
  description = "PostgreSQL version for the Neon project"
  type        = number
  default     = 16
}

variable "neon_org_id" {
  description = "Neon organization ID (set via TF_VAR_neon_org_id; empty = personal account)"
  type        = string
  default     = ""
}

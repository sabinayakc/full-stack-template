variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "name" {
  description = "Hyperdrive configuration name"
  type        = string
}

variable "origin_host" {
  description = "PostgreSQL host"
  type        = string
}

variable "origin_port" {
  description = "PostgreSQL port"
  type        = number
  default     = 5432
}

variable "origin_database" {
  description = "PostgreSQL database name"
  type        = string
}

variable "origin_user" {
  description = "PostgreSQL user"
  type        = string
}

variable "origin_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "disable_caching" {
  description = "Disable Hyperdrive query caching"
  type        = bool
  default     = false
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "name" {
  description = "Widget name (displayed in Cloudflare dashboard)"
  type        = string
}

variable "domains" {
  description = "List of domains where the widget is allowed"
  type        = list(string)
}

variable "mode" {
  description = "Widget mode: managed, non-interactive, or invisible"
  type        = string
  default     = "managed"
}

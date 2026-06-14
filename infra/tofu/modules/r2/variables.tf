variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "bucket_name" {
  description = "R2 bucket name"
  type        = string
}

variable "location" {
  description = "R2 bucket location hint"
  type        = string
  default     = "ENAM" # Eastern North America
}

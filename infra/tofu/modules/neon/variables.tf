variable "project_name" {
  description = "Neon project name"
  type        = string
}

variable "region" {
  description = "Neon region"
  type        = string
  default     = "aws-us-east-1"
}

variable "pg_version" {
  description = "PostgreSQL version"
  type        = number
  default     = 16
}

variable "org_id" {
  description = "Neon organization ID to create the project under (optional; uses personal account if empty)"
  type        = string
  default     = ""
}

variable "history_retention_seconds" {
  description = "Point-in-time restore window in seconds"
  type        = number
  default     = 86400 # 1 day
}

output "project_id" {
  description = "Neon project ID"
  value       = neon_project.this.id
}

output "branch_id" {
  description = "Default branch ID"
  value       = neon_project.this.default_branch_id
}

output "database_name" {
  description = "Database name"
  value       = neon_database.app.name
}

output "connection_uri" {
  description = "Pooled PostgreSQL connection string"
  value       = local.connection_uri
  sensitive   = true
}

output "host" {
  description = "Database host"
  value       = neon_project.this.database_host
}

output "database" {
  description = "Database name"
  value       = neon_database.app.name
}

output "user" {
  description = "Database user"
  value       = neon_role.app.name
}

output "password" {
  description = "Database password"
  value       = neon_role.app.password
  sensitive   = true
}

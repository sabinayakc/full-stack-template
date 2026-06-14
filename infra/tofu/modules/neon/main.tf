terraform {
  required_providers {
    neon = {
      source = "kislerdm/neon"
    }
  }
}

resource "neon_project" "this" {
  name                      = var.project_name
  org_id                    = var.org_id != "" ? var.org_id : null
  region_id                 = var.region
  pg_version                = var.pg_version
  history_retention_seconds = var.history_retention_seconds

  default_endpoint_settings {
    autoscaling_limit_min_cu = 0.25
    autoscaling_limit_max_cu = 2
  }
}

resource "neon_role" "app" {
  project_id = neon_project.this.id
  branch_id  = neon_project.this.default_branch_id
  name       = "app_db"
}

resource "neon_database" "app" {
  project_id = neon_project.this.id
  branch_id  = neon_project.this.default_branch_id
  name       = "app"
  owner_name = neon_role.app.name
}

# Pooled connection string for use by Hyperdrive / application
locals {
  connection_uri = "postgresql://${neon_role.app.name}:${neon_role.app.password}@${neon_project.this.database_host}/${neon_database.app.name}?sslmode=require"
}

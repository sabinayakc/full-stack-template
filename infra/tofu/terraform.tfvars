# Default tenant variables — override per deployment.
# Used with: tofu apply -var-file=environments/dev.tfvars

project_name    = "app"
domain          = "example.com"
neon_region     = "aws-us-east-2"
neon_pg_version = 18
neon_org_id     = "your-neon-org-id"

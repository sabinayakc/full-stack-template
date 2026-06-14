resource "cloudflare_hyperdrive_config" "this" {
  account_id = var.account_id
  name       = var.name

  origin = {
    scheme   = "postgresql"
    host     = var.origin_host
    port     = var.origin_port
    database = var.origin_database
    user     = var.origin_user
    password = var.origin_password
  }

  caching = {
    disabled = var.disable_caching
  }
}

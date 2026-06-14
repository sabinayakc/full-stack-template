resource "cloudflare_queue" "jobs" {
  account_id = var.account_id
  queue_name = var.queue_name
}

resource "cloudflare_queue" "dlq" {
  account_id = var.account_id
  queue_name = "${var.queue_name}-dlq"
}

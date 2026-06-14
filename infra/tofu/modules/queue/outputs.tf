output "queue_name" {
  description = "Queue name (use in wrangler.toml bindings)"
  value       = cloudflare_queue.jobs.queue_name
}

output "dlq_name" {
  description = "Dead-letter queue name"
  value       = cloudflare_queue.dlq.queue_name
}

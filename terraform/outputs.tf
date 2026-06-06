output "sqs_queue_url" {
  value = aws_sqs_queue.kyc_requests.url
}

output "sns_topic_arn" {
  value = aws_sns_topic.kyc_status_events.arn
}

output "s3_bucket" {
  value = aws_s3_bucket.kyc_documents.bucket
}

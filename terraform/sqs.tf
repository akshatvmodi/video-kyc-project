resource "aws_sqs_queue" "kyc_requests" {
  name                      = "kyc-requests"
  message_retention_seconds = 86400
  visibility_timeout_seconds = 30

  tags = { Project = var.project }
}

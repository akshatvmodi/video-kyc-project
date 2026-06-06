resource "aws_sns_topic" "kyc_status_events" {
  name = "kyc-status-events"
  tags = { Project = var.project }
}

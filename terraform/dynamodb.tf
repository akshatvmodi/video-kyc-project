resource "aws_dynamodb_table" "kyc_sessions" {
  name         = "kyc_sessions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = { Project = var.project }
}

resource "aws_dynamodb_table" "agents" {
  name         = "agents"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = { Project = var.project }
}

resource "aws_dynamodb_table" "webhook_logs" {
  name         = "webhook_logs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = { Project = var.project }
}

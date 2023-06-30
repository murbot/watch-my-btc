resource "aws_dynamodb_table" "alert_rule" {
  name         = "${var.prefix}_alert_rule"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
  }
  tags = var.tags
}

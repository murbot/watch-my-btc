resource "aws_iam_role" "process_alert_rule_lambda_role" {
  name               = "${var.prefix}_process_alert_rule_lambda_role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Effect = "Allow",
      },
    ]
  })
}

resource "aws_iam_role_policy" "process_alert_rule_lambda_role_policy" {
  name   = "${aws_iam_role.process_alert_rule_lambda_role.name}_policy"
  role   = aws_iam_role.process_alert_rule_lambda_role.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem"
        ],
        Resource = [
          "${aws_dynamodb_table.alert_rule.arn}"
        ],
        Effect = "Allow"
      },
      {
        Action = [
          "ses:SendEmail"
        ],
        Resource = "*",
        Effect   = "Allow"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "process_alert_rule_lambda_role_policy_attachment" {
  role       = aws_iam_role.process_alert_rule_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "process_alert_rule_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/"
  output_path = "${path.module}/../archives/process-alert-rule-lambda.zip"
  excludes    = [
    "create-alert-rule-lambda",
    "delete-alert-rule-lambda",
    "contact-us-lambda"
  ]
}

resource "aws_lambda_function" "process_alert_rule_lambda" {
  function_name    = "${var.prefix}_process_alert_rule_lambda"
  filename         = data.archive_file.process_alert_rule_lambda.output_pathtf
  runtime          = "nodejs22.x"
  handler          = "process-alert-rule-lambda/index.handler"
  source_code_hash = filebase64sha256(data.archive_file.process_alert_rule_lambda.output_path)
  role             = aws_iam_role.process_alert_rule_lambda_role.arn

  timeout     = 30
  memory_size = 128

  reserved_concurrent_executions = 25

  environment {
    variables = {
      ALERT_RULE_TABLE_NAME = aws_dynamodb_table.alert_rule.name
      FROM_EMAIL            = var.from_email
    }
  }
}

resource aws_lambda_permission "process_alert_rule_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_alert_rule_lambda.function_name
  principal     = "events.amazonaws.com"
}

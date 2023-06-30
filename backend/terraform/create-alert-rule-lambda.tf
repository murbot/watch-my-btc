resource "aws_iam_role" "create_alert_rule_lambda_role" {
  name               = "${var.prefix}_create_alert_rule_lambda"
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

resource "aws_iam_role_policy" "create_alert_rule_lambda_role_policy" {
  name   = "${aws_iam_role.create_alert_rule_lambda_role.name}_policy"
  role   = aws_iam_role.create_alert_rule_lambda_role.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem"
        ],
        Resource = [
          "${aws_dynamodb_table.alert_rule.arn}"
        ],
        Effect = "Allow",
      },
      {
        Action = [
          "events:PutRule",
          "events:PutTargets",
        ],
        Resource = "*"
        Effect   = "Allow"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "create_alert_rule_lambda_role_policy_attachment" {
  role       = aws_iam_role.create_alert_rule_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "create_alert_rule_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/"
  output_path = "${path.module}/../archives/create-alert-rule-lambda.zip"
  excludes    = [
    "process-alert-rule-lambda",
    "delete-alert-rule-lambda",
    "contact-us-lambda"
  ]
}

resource "aws_lambda_function" "create_alert_rule_lambda" {
  function_name    = "${var.prefix}_create_alert_rule_lambda"
  filename         = data.archive_file.create_alert_rule_lambda.output_path
  runtime          = "nodejs18.x"
  handler          = "create-alert-rule-lambda/index.handler"
  source_code_hash = filebase64sha256(data.archive_file.create_alert_rule_lambda.output_path)
  role             = aws_iam_role.create_alert_rule_lambda_role.arn

  timeout     = 30
  memory_size = 128

  reserved_concurrent_executions = 25

  environment {
    variables = {
      ALERT_RULE_TABLE_NAME         = aws_dynamodb_table.alert_rule.name
      PROCESS_ALERT_RULE_LAMBDA_ARN = aws_lambda_function.process_alert_rule_lambda.arn
      FROM_EMAIL = var.from_email
    }
  }
}

resource "aws_lambda_permission" "create_alert_rule_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_alert_rule_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.bwa_api.execution_arn}/*/*"
}

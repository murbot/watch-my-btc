resource "aws_iam_role" "contact_us_lambda_role" {
  name               = "${var.prefix}_contact_us_lambda_role"
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

resource "aws_iam_role_policy" "contact_us_lambda_role_policy" {
  name   = "${aws_iam_role.contact_us_lambda_role.name}_policy"
  role   = aws_iam_role.contact_us_lambda_role.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
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

resource "aws_iam_role_policy_attachment" "contact_us_lambda_role_policy_attachment" {
  role       = aws_iam_role.contact_us_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "contact_us_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/"
  output_path = "${path.module}/../archives/contact-us-lambda.zip"
  excludes    = [
    "create-alert-rule-lambda",
    "delete-alert-rule-lambda",
    "process-alert-rule-lambda"
  ]
}

resource "aws_lambda_function" "contact_us_lambda" {
  function_name    = "${var.prefix}_contact_us_lambda"
  filename         = data.archive_file.contact_us_lambda.output_path
  runtime          = "nodejs22.x"
  handler          = "contact-us-lambda/index.handler"
  source_code_hash = filebase64sha256(data.archive_file.contact_us_lambda.output_path)
  role             = aws_iam_role.contact_us_lambda_role.arn

  timeout     = 30
  memory_size = 128

  reserved_concurrent_executions = 25

  environment {
    variables = {
      CONTACT_US_RECIPIENT_EMAIL = var.contact_us_recipient_email
      FROM_EMAIL            = var.from_email
    }
  }
}

resource "aws_lambda_permission" "contact_us_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact_us_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.bwa_api.execution_arn}/*/*"
}


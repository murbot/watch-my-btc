resource "aws_cloudwatch_log_group" "bwa_api" {
  name              = "/aws/api_gw/${aws_apigatewayv2_api.bwa_api.name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "create_alert_rule_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.create_alert_rule_lambda.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "process_alert_rule_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.process_alert_rule_lambda.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "delete_alert_rule_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.delete_alert_rule_lambda.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "contact_us_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.contact_us_lambda.function_name}"
  retention_in_days = 30
}

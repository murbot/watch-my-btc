resource "aws_apigatewayv2_api" "bwa_api" {
  name          = "watch_my_btc_api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["*"]
    allow_methods = ["POST", "GET", "OPTIONS", "DELETE", "PUT"]
    allow_origins = ["https://watchmybtc.com", "http://localhost:4200"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "development" {
  api_id = aws_apigatewayv2_api.bwa_api.id

  name        = "bwa_development"
  auto_deploy = true

  route_settings {
    route_key              = "${aws_apigatewayv2_route.create_alert_rule_lambda.route_key}"
    throttling_burst_limit = 100
    throttling_rate_limit  = 100
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.bwa_api.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    }
    )
  }
}

resource "aws_apigatewayv2_integration" "create_alert_rule_lambda" {
  api_id = aws_apigatewayv2_api.bwa_api.id

  integration_uri    = aws_lambda_function.create_alert_rule_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "create_alert_rule_lambda" {
  api_id = aws_apigatewayv2_api.bwa_api.id

  route_key = "POST /alertRules"
  target    = "integrations/${aws_apigatewayv2_integration.create_alert_rule_lambda.id}"
}

resource "aws_apigatewayv2_integration" "delete_alert_rule_lambda" {
  api_id = aws_apigatewayv2_api.bwa_api.id

  integration_uri    = aws_lambda_function.delete_alert_rule_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "delete_alert_rule_lambda" {
  api_id = aws_apigatewayv2_api.bwa_api.id

  route_key = "POST /alertRules/delete"
  target    = "integrations/${aws_apigatewayv2_integration.delete_alert_rule_lambda.id}"
}

resource "aws_apigatewayv2_integration" "contact_us_lambda" {
  api_id = aws_apigatewayv2_api.bwa_api.id

  integration_uri    = aws_lambda_function.contact_us_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "contact_us_lambda" {
  api_id = aws_apigatewayv2_api.bwa_api.id

  route_key = "POST /contactUs"
  target    = "integrations/${aws_apigatewayv2_integration.contact_us_lambda.id}"
}

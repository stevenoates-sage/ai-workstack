output "app_url" {
  description = "Live URL of the deployed Amplify app"
  value       = "https://master.${aws_amplify_app.main.default_domain}"
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID — needed by the React app"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito App Client ID — needed by the React app"
  value       = aws_cognito_user_pool_client.web.id
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for ticket storage"
  value       = aws_dynamodb_table.tickets.name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN — needed for IAM policies in Phase 2"
  value       = aws_dynamodb_table.tickets.arn
}

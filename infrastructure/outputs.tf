output "frontend_bucket_name" {
  description = "Name of the S3 bucket hosting the frontend"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_website_endpoint" {
  description = "Website endpoint for the S3 bucket"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "Public URL for the frontend application"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.api.id
}

output "api_gateway_endpoint" {
  description = "Endpoint URL for the API Gateway"
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "api_url" {
  description = "Full API URL including stage"
  value       = "${aws_apigatewayv2_api.api.api_endpoint}/prod"
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.api.arn
}

output "deployment_instructions" {
  description = "Instructions for deploying the application"
  value = <<-EOT
    
    ========================================
    DEPLOYMENT SUCCESSFUL!
    ========================================
    
    Frontend URL: https://${aws_cloudfront_distribution.frontend.domain_name}
    API URL: ${aws_apigatewayv2_api.api.api_endpoint}/prod
    
    Next Steps:
    1. Update frontend/.env with API URL:
       VITE_API_URL=${aws_apigatewayv2_api.api.api_endpoint}/prod
    
    2. Build and deploy frontend:
       cd ../frontend
       npm run build
       aws s3 sync dist/ s3://${aws_s3_bucket.frontend.id}/ --delete
    
    3. Invalidate CloudFront cache:
       aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.frontend.id} --paths "/*"
    
    4. Deploy backend Lambda:
       cd ../backend
       ./deploy-lambda.sh
    
    ========================================
  EOT
}

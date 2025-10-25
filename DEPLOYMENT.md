# Deployment Guide

This guide provides step-by-step instructions for deploying the Workflow Builder application to AWS.

## Prerequisites Checklist

- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Terraform 1.6+ installed
- [ ] Node.js 18+ and npm installed
- [ ] Python 3.11+ installed
- [ ] (Optional) OpenAI API key for AI features

## Quick Deployment

### Automated Full Deployment

```bash
# Make scripts executable
chmod +x scripts/deploy-all.sh backend/deploy-lambda.sh

# Run full deployment
./scripts/deploy-all.sh
```

This will deploy everything in the correct order and provide you with the URLs.

## Step-by-Step Deployment

### 1. Prepare AWS Credentials

Ensure your AWS credentials are configured:
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
```

### 2. Deploy Infrastructure

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Review what will be created
terraform plan

# Apply the infrastructure
# If you have an OpenAI API key:
terraform apply -var="openai_api_key=sk-your-key-here"

# Without OpenAI API key (will use fallback logic):
terraform apply

# Save the outputs
terraform output -json > outputs.json
terraform output
```

**Expected Resources Created:**
- S3 bucket for frontend hosting
- CloudFront distribution for CDN
- Lambda function for backend API
- API Gateway HTTP API
- IAM roles and policies
- CloudWatch log groups

### 3. Deploy Backend to Lambda

```bash
cd ../backend

# Run the deployment script
./deploy-lambda.sh
```

This script will:
- Install Python dependencies
- Package the application code
- Upload to Lambda
- Test the deployment

### 4. Deploy Frontend to S3

```bash
cd ../frontend

# Get the infrastructure outputs
FRONTEND_BUCKET=$(cd ../infrastructure && terraform output -raw frontend_bucket_name)
API_URL=$(cd ../infrastructure && terraform output -raw api_url)
CLOUDFRONT_ID=$(cd ../infrastructure && terraform output -raw cloudfront_distribution_id)

# Create production environment file
cat > .env << EOF
VITE_API_URL=$API_URL
VITE_APP_NAME=Workflow Builder
VITE_APP_VERSION=1.0.0
VITE_ENABLE_AI_GENERATION=true
VITE_ENABLE_EXPORT_PNG=true
VITE_ENABLE_VALIDATION=true
EOF

# Install dependencies
npm install

# Build the application
npm run build

# Deploy to S3
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*"
```

### 5. Verify Deployment

```bash
# Get the URLs
cd ../infrastructure
echo "Frontend URL: $(terraform output -raw frontend_url)"
echo "API URL: $(terraform output -raw api_url)"

# Test the API
curl $(terraform output -raw api_url)
```

## GitHub Actions Deployment

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `OPENAI_API_KEY` (optional)

### Trigger Deployment

**Option 1: Automatic (on push to main)**
```bash
git add .
git commit -m "Deploy application"
git push origin main
```

**Option 2: Manual Workflow Dispatch**
1. Go to Actions tab in GitHub
2. Select "Deploy Infrastructure" workflow
3. Click "Run workflow"
4. Choose action (plan/apply)

The workflows will run in sequence:
1. Deploy Infrastructure
2. Deploy Backend (triggered after infrastructure)
3. Deploy Frontend (triggered after backend)

## Updating the Application

### Update Backend Only

```bash
cd backend
./deploy-lambda.sh
```

### Update Frontend Only

```bash
cd frontend

# Ensure .env has correct API_URL
npm run build

# Get bucket name
FRONTEND_BUCKET=$(cd ../infrastructure && terraform output -raw frontend_bucket_name)
CLOUDFRONT_ID=$(cd ../infrastructure && terraform output -raw cloudfront_distribution_id)

# Deploy
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

### Update Infrastructure

```bash
cd infrastructure
terraform plan
terraform apply
```

## Troubleshooting

### Lambda Deployment Fails

**Issue**: Package too large
```bash
# Check package size
du -h backend/lambda_deployment.zip
```

**Solution**: Ensure you're using `requirements-lambda.txt` which excludes unnecessary packages.

### Frontend Not Updating

**Issue**: CloudFront cache not invalidated

**Solution**:
```bash
CLOUDFRONT_ID=$(cd infrastructure && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

### API CORS Errors

**Issue**: Frontend can't connect to API

**Solution**: Update Lambda environment variables with correct ALLOWED_ORIGINS:
```bash
LAMBDA_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'workflow-builder')].FunctionName" --output text)
CLOUDFRONT_URL=$(cd infrastructure && terraform output -raw frontend_url)

aws lambda update-function-configuration \
  --function-name $LAMBDA_NAME \
  --environment "Variables={ALLOWED_ORIGINS=$CLOUDFRONT_URL}"
```

### Terraform State Lock

**Issue**: State locked from previous operation

**Solution**:
```bash
cd infrastructure
terraform force-unlock <LOCK_ID>
```

## Monitoring

### View Lambda Logs

```bash
LAMBDA_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'workflow-builder')].FunctionName" --output text)

aws logs tail /aws/lambda/$LAMBDA_NAME --follow
```

### View API Gateway Logs

```bash
API_NAME=$(aws apigatewayv2 get-apis --query "Items[?contains(Name, 'workflow-builder')].Name" --output text)

aws logs tail /aws/apigateway/$API_NAME --follow
```

### CloudFront Metrics

```bash
CLOUDFRONT_ID=$(cd infrastructure && terraform output -raw cloudfront_distribution_id)

aws cloudfront get-distribution-config --id $CLOUDFRONT_ID
```

## Cost Estimation

**Monthly costs (approximate):**
- S3 Storage: $0.023/GB (~$0.50 for typical app)
- CloudFront: $0.085/GB for first 10TB + requests (~$5-20)
- Lambda: $0.20 per 1M requests + compute time (~$1-10)
- API Gateway: $1.00 per million requests (~$1-5)

**Total estimated cost**: $10-40/month depending on traffic

**Free Tier eligible** for first 12 months:
- Lambda: 1M free requests/month
- API Gateway: 1M free requests/month
- CloudFront: 1TB data transfer/month

## Cleanup

To destroy all AWS resources:

```bash
cd infrastructure
terraform destroy
```

**Warning**: This will delete all data including S3 buckets and Lambda functions.

## Security Best Practices

1. **Never commit secrets**: Use `.env` files (gitignored)
2. **Use IAM roles**: Avoid hardcoding AWS credentials
3. **Enable CloudTrail**: Audit all AWS API calls
4. **Set up billing alerts**: Monitor AWS costs
5. **Use HTTPS only**: Enforced by CloudFront
6. **Rotate credentials**: Regularly update API keys
7. **Least privilege**: IAM roles have minimal permissions

## Next Steps

After successful deployment:

1. Test the application thoroughly
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Enable WAF for additional security (optional)
5. Set up backup strategy for workflows
6. Document any custom configurations

## Support

For issues or questions:
- Check the main README.md
- Review AWS CloudWatch logs
- Open an issue on GitHub

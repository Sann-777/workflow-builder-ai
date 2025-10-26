#!/bin/bash

# Setup Terraform Backend (S3 + DynamoDB)
# This script should only be run ONCE during initial setup

set -e

echo "🔧 Setting up Terraform backend resources..."
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS CLI is not configured or credentials are invalid"
    echo "Please run 'aws configure' first"
    exit 1
fi

# Check if resources already exist
echo "Checking if backend resources already exist..."

BUCKET_EXISTS=$(aws s3 ls | grep workflow-builder-terraform-state || echo "")
TABLE_EXISTS=$(aws dynamodb list-tables | grep workflow-builder-terraform-locks || echo "")

if [ -n "$BUCKET_EXISTS" ] && [ -n "$TABLE_EXISTS" ]; then
    echo "✅ Backend resources already exist:"
    echo "   - S3 Bucket: workflow-builder-terraform-state"
    echo "   - DynamoDB Table: workflow-builder-terraform-locks"
    echo ""
    echo "No action needed. Your infrastructure is ready to deploy."
    exit 0
fi

if [ -n "$BUCKET_EXISTS" ]; then
    echo "⚠️  S3 bucket exists but DynamoDB table is missing"
elif [ -n "$TABLE_EXISTS" ]; then
    echo "⚠️  DynamoDB table exists but S3 bucket is missing"
else
    echo "📦 Backend resources do not exist. Creating them now..."
fi

echo ""
echo "Creating backend resources with Terraform..."
cd "$(dirname "$0")/../infrastructure/backend-setup"

terraform init
terraform apply -auto-approve

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. The main infrastructure can now use remote state"
echo "2. Run './scripts/deploy-all.sh' to deploy the application"
echo "3. Or push to main branch to trigger GitHub Actions deployment"

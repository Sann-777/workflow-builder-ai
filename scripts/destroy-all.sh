#!/bin/bash
set -e

echo "🗑️  Destroying Workflow Builder infrastructure..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Confirmation
echo -e "${RED}⚠️  WARNING: This will delete ALL AWS resources!${NC}"
echo -e "${YELLOW}This includes:${NC}"
echo "  - S3 bucket and all files"
echo "  - CloudFront distribution"
echo "  - Lambda function"
echo "  - API Gateway"
echo "  - IAM roles and policies"
echo "  - CloudWatch log groups"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r
echo
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo -e "${BLUE}Destruction cancelled.${NC}"
    exit 0
fi

cd infrastructure

# Get resource names before destroying
echo -e "${BLUE}Getting resource information...${NC}"
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name 2>/dev/null || echo "")
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

# Empty S3 bucket first (required before deletion)
if [ -n "$FRONTEND_BUCKET" ]; then
    echo -e "${BLUE}Emptying S3 bucket: $FRONTEND_BUCKET${NC}"
    aws s3 rm s3://$FRONTEND_BUCKET/ --recursive --no-cli-pager || true
fi

# Disable CloudFront distribution first (required before deletion)
if [ -n "$CLOUDFRONT_ID" ]; then
    echo -e "${BLUE}Disabling CloudFront distribution: $CLOUDFRONT_ID${NC}"
    echo -e "${YELLOW}This may take a few minutes...${NC}"
    
    # Get current config
    aws cloudfront get-distribution-config --id $CLOUDFRONT_ID > /tmp/cf-config.json 2>/dev/null || true
    
    if [ -f /tmp/cf-config.json ]; then
        # Extract ETag and disable distribution
        ETAG=$(cat /tmp/cf-config.json | jq -r '.ETag')
        cat /tmp/cf-config.json | jq '.DistributionConfig.Enabled = false | .DistributionConfig' > /tmp/cf-config-disabled.json
        
        aws cloudfront update-distribution \
            --id $CLOUDFRONT_ID \
            --distribution-config file:///tmp/cf-config-disabled.json \
            --if-match $ETAG \
            --no-cli-pager > /dev/null 2>&1 || true
        
        echo -e "${YELLOW}Waiting for CloudFront to disable (this takes 5-10 minutes)...${NC}"
        aws cloudfront wait distribution-deployed --id $CLOUDFRONT_ID 2>/dev/null || true
        
        rm -f /tmp/cf-config.json /tmp/cf-config-disabled.json
    fi
fi

# Destroy infrastructure with Terraform
echo -e "${BLUE}Destroying infrastructure with Terraform...${NC}"
terraform destroy -auto-approve

cd ..

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}🗑️  DESTRUCTION COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "All AWS resources have been deleted."
echo -e "You can redeploy anytime with: ${BLUE}./scripts/deploy-all.sh${NC}"
echo -e "${GREEN}========================================${NC}"

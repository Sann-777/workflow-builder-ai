#!/bin/bash
set -e

echo "🔧 Setting up Terraform remote state backend..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd infrastructure

echo -e "${BLUE}Step 1: Creating S3 bucket and DynamoDB table for state...${NC}"

# Temporarily comment out backend configuration
echo -e "${YELLOW}Temporarily disabling backend configuration...${NC}"
cp providers.tf providers.tf.backup

# Remove backend block for initial setup
sed -i.tmp '/backend "s3"/,/}/d' providers.tf

# Create backend resources
echo -e "${BLUE}Creating state backend resources...${NC}"
terraform init
terraform apply -target=aws_s3_bucket.terraform_state -target=aws_s3_bucket_versioning.terraform_state -target=aws_s3_bucket_server_side_encryption_configuration.terraform_state -target=aws_s3_bucket_public_access_block.terraform_state -target=aws_dynamodb_table.terraform_locks -auto-approve

echo -e "${GREEN}✓ Backend resources created${NC}"

# Restore original providers.tf with backend
echo -e "${BLUE}Step 2: Enabling remote backend...${NC}"
mv providers.tf.backup providers.tf
rm -f providers.tf.tmp

# Migrate state to S3
echo -e "${BLUE}Migrating state to S3...${NC}"
terraform init -migrate-state -force-copy

echo -e "${GREEN}✓ State migrated to S3${NC}"

cd ..

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Terraform Backend Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "State is now stored in:"
echo -e "  S3 Bucket: ${BLUE}workflow-builder-terraform-state${NC}"
echo -e "  DynamoDB Table: ${BLUE}workflow-builder-terraform-locks${NC}"
echo ""
echo -e "GitHub Actions will now reuse existing resources instead of creating new ones."
echo -e "${GREEN}========================================${NC}"

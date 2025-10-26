#!/bin/bash
set -e

echo "🚀 Starting full deployment of Workflow Builder..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Step 1: Deploy Infrastructure
echo -e "\n${YELLOW}=== Step 1: Deploying Infrastructure ===${NC}"
cd infrastructure

terraform init
terraform plan -out=tfplan
terraform apply -auto-approve tfplan

# Get outputs
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)
API_URL=$(terraform output -raw api_url)
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id)
CLOUDFRONT_URL=$(terraform output -raw frontend_url)
LAMBDA_NAME=$(terraform output -raw lambda_function_name)

echo -e "${GREEN}✓ Infrastructure deployed${NC}"
echo -e "  Frontend Bucket: $FRONTEND_BUCKET"
echo -e "  API URL: $API_URL"
echo -e "  CloudFront URL: $CLOUDFRONT_URL"
echo -e "  Lambda Function: $LAMBDA_NAME"

cd ..

# Step 2: Deploy Backend
echo -e "\n${YELLOW}=== Step 2: Deploying Backend ===${NC}"
cd backend

echo -e "${BLUE}Building Lambda package...${NC}"
rm -rf package lambda_deployment.zip

# Check if Docker is available for cross-platform build
if command -v docker &> /dev/null; then
    echo -e "${BLUE}Using Docker for Linux x86_64 build...${NC}"
    docker run --platform linux/amd64 --rm \
      --entrypoint "" \
      -v "$PWD":/var/task \
      -w /var/task \
      public.ecr.aws/lambda/python:3.11 \
      pip install -r requirements-lambda.txt -t package
else
    echo -e "${YELLOW}Docker not available, using local pip (may have compatibility issues)${NC}"
    mkdir -p package
    pip3 install -r requirements-lambda.txt -t package/
fi

echo -e "${BLUE}Packaging Lambda function...${NC}"
cp -r app package/
cp lambda_handler.py package/
cd package
zip -r ../lambda_deployment.zip . -x "*.pyc" "*__pycache__*" > /dev/null
cd ..

SIZE=$(du -h lambda_deployment.zip | cut -f1)
echo -e "${BLUE}Package size: $SIZE${NC}"

echo -e "${BLUE}Deploying to Lambda...${NC}"
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --zip-file fileb://lambda_deployment.zip \
  --no-cli-pager > /dev/null

aws lambda wait function-updated --function-name "$LAMBDA_NAME"

echo -e "${BLUE}Updating Lambda environment variables...${NC}"
aws lambda update-function-configuration \
  --function-name "$LAMBDA_NAME" \
  --environment "Variables={
    APP_NAME='Workflow Builder API',
    APP_VERSION='1.0.0',
    DEBUG='false',
    ALLOWED_ORIGINS='$CLOUDFRONT_URL,http://localhost:3000',
    OPENAI_API_KEY='${OPENAI_API_KEY:-}',
    AI_MODEL='gpt-4o-mini',
    ENVIRONMENT='production'
  }" \
  --no-cli-pager > /dev/null

aws lambda wait function-updated --function-name "$LAMBDA_NAME"

cd ..

echo -e "${GREEN}✓ Backend deployed${NC}"

# Test API
echo -e "${BLUE}Testing API...${NC}"
API_RESPONSE=$(curl -s "$API_URL/" || echo "Failed")
if echo "$API_RESPONSE" | grep -q "Workflow Builder API"; then
    echo -e "${GREEN}✓ API is responding correctly${NC}"
else
    echo -e "${YELLOW}⚠ API response unexpected (may take a moment to initialize)${NC}"
fi

# Step 3: Deploy Frontend
echo -e "\n${YELLOW}=== Step 3: Deploying Frontend ===${NC}"
cd frontend

# Create .env file
echo -e "${BLUE}Creating production environment configuration...${NC}"
cat > .env << EOF
VITE_API_URL=$API_URL
VITE_APP_NAME=Workflow Builder
VITE_APP_VERSION=1.0.0
VITE_ENABLE_AI_GENERATION=true
VITE_ENABLE_EXPORT_PNG=true
VITE_ENABLE_VALIDATION=true
EOF

# Install dependencies and build
echo -e "${BLUE}Installing dependencies...${NC}"
npm install > /dev/null 2>&1

echo -e "${BLUE}Building frontend...${NC}"
npm run build

# Deploy to S3
echo -e "${BLUE}Deploying to S3...${NC}"
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete --no-cli-pager

# Fix content-type for HTML files and set cache control
echo -e "${BLUE}Setting correct content-type for HTML files...${NC}"
aws s3 cp s3://$FRONTEND_BUCKET/index.html s3://$FRONTEND_BUCKET/index.html \
  --content-type "text/html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --metadata-directive REPLACE \
  --no-cli-pager

# Invalidate CloudFront cache
echo -e "${BLUE}Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*" \
  --no-cli-pager > /dev/null

cd ..

echo -e "${GREEN}✓ Frontend deployed${NC}"

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "Frontend URL: ${BLUE}$CLOUDFRONT_URL${NC}"
echo -e "API URL: ${BLUE}$API_URL${NC}/"
echo -e "API Docs: ${BLUE}${API_URL}/docs${NC}"
echo -e ""
echo -e "Testing endpoints..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CLOUDFRONT_URL")
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/")

echo -e "Frontend Status: HTTP $FRONTEND_STATUS"
echo -e "API Status: HTTP $API_STATUS"
echo -e ""
echo -e "Your Workflow Builder is now live! 🚀"
echo -e "${GREEN}========================================${NC}"

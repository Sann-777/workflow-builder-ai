#!/bin/bash
set -e

echo "🚀 Deploying Lambda function..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get Lambda function name
echo -e "${BLUE}Finding Lambda function...${NC}"
LAMBDA_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'workflow-builder')].FunctionName" --output text | head -n 1)

if [ -z "$LAMBDA_NAME" ]; then
    echo -e "${RED}Error: No Lambda function found. Please deploy infrastructure first.${NC}"
    exit 1
fi

echo -e "${GREEN}Found Lambda function: $LAMBDA_NAME${NC}"

# Create package directory
echo -e "${BLUE}Installing dependencies with Docker (Linux x86_64)...${NC}"
rm -rf package
mkdir -p package

# Install dependencies using Docker for correct platform
docker run --platform linux/amd64 --rm --entrypoint "" -v "$PWD":/var/task -w /var/task public.ecr.aws/lambda/python:3.11 pip install -r requirements-lambda.txt -t package > /dev/null 2>&1

# Copy application code
echo -e "${BLUE}Packaging application code...${NC}"
cp -r app package/
cp lambda_handler.py package/

# Create deployment package
cd package
zip -r ../lambda_deployment.zip . -x "*.pyc" "*__pycache__*" > /dev/null
cd ..

echo -e "${GREEN}Package created: $(du -h lambda_deployment.zip | cut -f1)${NC}"

# Deploy to Lambda
echo -e "${BLUE}Uploading to Lambda...${NC}"
aws lambda update-function-code \
    --function-name "$LAMBDA_NAME" \
    --zip-file fileb://lambda_deployment.zip

# Wait for update to complete
echo -e "${BLUE}Waiting for Lambda update...${NC}"
aws lambda wait function-updated --function-name "$LAMBDA_NAME"

echo -e "${GREEN}✅ Lambda function deployed successfully!${NC}"

# Test the function
echo -e "${BLUE}Testing Lambda function...${NC}"
aws lambda invoke \
    --function-name "$LAMBDA_NAME" \
    --payload '{"rawPath": "/", "requestContext": {"http": {"method": "GET"}}}' \
    response.json > /dev/null

echo -e "${GREEN}Response:${NC}"
cat response.json | python -m json.tool

# Cleanup
rm -rf package lambda_deployment.zip response.json

echo -e "${GREEN}🎉 Deployment complete!${NC}"

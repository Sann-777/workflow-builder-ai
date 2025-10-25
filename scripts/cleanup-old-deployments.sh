#!/bin/bash
set -e

echo "🧹 Cleaning up old/orphaned AWS resources..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}This script will find and delete orphaned workflow-builder resources${NC}"
echo ""

# Find all S3 buckets
echo -e "${BLUE}Finding S3 buckets...${NC}"
BUCKETS=$(aws s3api list-buckets --query "Buckets[?starts_with(Name, 'workflow-builder-frontend')].Name" --output text)

if [ -n "$BUCKETS" ]; then
    echo -e "${YELLOW}Found S3 buckets:${NC}"
    echo "$BUCKETS"
    echo ""
    read -p "Delete these buckets? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
        for bucket in $BUCKETS; do
            echo -e "${BLUE}Emptying and deleting: $bucket${NC}"
            aws s3 rm s3://$bucket/ --recursive --no-cli-pager || true
            aws s3api delete-bucket --bucket $bucket --no-cli-pager || true
        done
        echo -e "${GREEN}✓ S3 buckets deleted${NC}"
    fi
else
    echo "No workflow-builder S3 buckets found"
fi

echo ""

# Find all CloudFront distributions
echo -e "${BLUE}Finding CloudFront distributions...${NC}"
DISTRIBUTIONS=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Comment, 'workflow-builder')].{Id:Id,Comment:Comment,Status:Status}" --output table)

if [ -n "$DISTRIBUTIONS" ]; then
    echo "$DISTRIBUTIONS"
    echo ""
    echo -e "${YELLOW}Note: CloudFront distributions must be disabled before deletion${NC}"
    echo -e "${YELLOW}This process takes 15-20 minutes per distribution${NC}"
    read -p "Disable and delete CloudFront distributions? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
        DIST_IDS=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Comment, 'workflow-builder')].Id" --output text)
        for dist_id in $DIST_IDS; do
            echo -e "${BLUE}Processing distribution: $dist_id${NC}"
            
            # Get current config
            aws cloudfront get-distribution-config --id $dist_id > /tmp/cf-$dist_id.json
            ETAG=$(cat /tmp/cf-$dist_id.json | jq -r '.ETag')
            
            # Check if already disabled
            ENABLED=$(cat /tmp/cf-$dist_id.json | jq -r '.DistributionConfig.Enabled')
            
            if [ "$ENABLED" = "true" ]; then
                echo "Disabling distribution..."
                cat /tmp/cf-$dist_id.json | jq '.DistributionConfig.Enabled = false | .DistributionConfig' > /tmp/cf-$dist_id-disabled.json
                
                aws cloudfront update-distribution \
                    --id $dist_id \
                    --distribution-config file:///tmp/cf-$dist_id-disabled.json \
                    --if-match $ETAG \
                    --no-cli-pager || true
                
                echo "Waiting for distribution to be disabled (this takes time)..."
                aws cloudfront wait distribution-deployed --id $dist_id || true
            fi
            
            # Get new ETag and delete
            aws cloudfront get-distribution-config --id $dist_id > /tmp/cf-$dist_id-final.json
            ETAG=$(cat /tmp/cf-$dist_id-final.json | jq -r '.ETag')
            
            echo "Deleting distribution..."
            aws cloudfront delete-distribution --id $dist_id --if-match $ETAG --no-cli-pager || true
            
            rm -f /tmp/cf-$dist_id*.json
        done
        echo -e "${GREEN}✓ CloudFront distributions processed${NC}"
    fi
else
    echo "No workflow-builder CloudFront distributions found"
fi

echo ""

# Find all Lambda functions
echo -e "${BLUE}Finding Lambda functions...${NC}"
FUNCTIONS=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'workflow-builder')].FunctionName" --output text)

if [ -n "$FUNCTIONS" ]; then
    echo -e "${YELLOW}Found Lambda functions:${NC}"
    echo "$FUNCTIONS"
    echo ""
    read -p "Delete these functions? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
        for func in $FUNCTIONS; do
            echo -e "${BLUE}Deleting: $func${NC}"
            aws lambda delete-function --function-name $func --no-cli-pager || true
        done
        echo -e "${GREEN}✓ Lambda functions deleted${NC}"
    fi
else
    echo "No workflow-builder Lambda functions found"
fi

echo ""

# Find all API Gateways
echo -e "${BLUE}Finding API Gateways...${NC}"
APIS=$(aws apigatewayv2 get-apis --query "Items[?contains(Name, 'workflow-builder')].{Name:Name,ApiId:ApiId}" --output table)

if [ -n "$APIS" ]; then
    echo "$APIS"
    echo ""
    read -p "Delete these APIs? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
        API_IDS=$(aws apigatewayv2 get-apis --query "Items[?contains(Name, 'workflow-builder')].ApiId" --output text)
        for api_id in $API_IDS; do
            echo -e "${BLUE}Deleting: $api_id${NC}"
            aws apigatewayv2 delete-api --api-id $api_id --no-cli-pager || true
        done
        echo -e "${GREEN}✓ API Gateways deleted${NC}"
    fi
else
    echo "No workflow-builder API Gateways found"
fi

echo ""

# Find all IAM roles
echo -e "${BLUE}Finding IAM roles...${NC}"
ROLES=$(aws iam list-roles --query "Roles[?contains(RoleName, 'workflow-builder')].RoleName" --output text)

if [ -n "$ROLES" ]; then
    echo -e "${YELLOW}Found IAM roles:${NC}"
    echo "$ROLES"
    echo ""
    read -p "Delete these roles? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
        for role in $ROLES; do
            echo -e "${BLUE}Deleting policies and role: $role${NC}"
            
            # Delete inline policies
            POLICIES=$(aws iam list-role-policies --role-name $role --query "PolicyNames" --output text)
            for policy in $POLICIES; do
                aws iam delete-role-policy --role-name $role --policy-name $policy || true
            done
            
            # Detach managed policies
            ATTACHED=$(aws iam list-attached-role-policies --role-name $role --query "AttachedPolicies[].PolicyArn" --output text)
            for policy_arn in $ATTACHED; do
                aws iam detach-role-policy --role-name $role --policy-arn $policy_arn || true
            done
            
            # Delete role
            aws iam delete-role --role-name $role || true
        done
        echo -e "${GREEN}✓ IAM roles deleted${NC}"
    fi
else
    echo "No workflow-builder IAM roles found"
fi

echo ""

# Find CloudWatch log groups
echo -e "${BLUE}Finding CloudWatch log groups...${NC}"
LOG_GROUPS=$(aws logs describe-log-groups --query "logGroups[?contains(logGroupName, 'workflow-builder')].logGroupName" --output text)

if [ -n "$LOG_GROUPS" ]; then
    echo -e "${YELLOW}Found log groups:${NC}"
    echo "$LOG_GROUPS"
    echo ""
    read -p "Delete these log groups? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
        for log_group in $LOG_GROUPS; do
            echo -e "${BLUE}Deleting: $log_group${NC}"
            aws logs delete-log-group --log-group-name $log_group || true
        done
        echo -e "${GREEN}✓ Log groups deleted${NC}"
    fi
else
    echo "No workflow-builder log groups found"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🧹 Cleanup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "All orphaned workflow-builder resources have been processed."
echo -e "You can now run ${BLUE}./scripts/deploy-all.sh${NC} for a fresh deployment."

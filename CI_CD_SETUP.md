# CI/CD Setup Guide

This guide will help you set up automated deployment using GitHub Actions.

## 📋 Prerequisites

- GitHub account
- AWS account with appropriate permissions
- Repository pushed to GitHub

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create GitHub Repository

```bash
cd workflow-builder-test

# Initialize git if not already done
git init

# Add all files
git add .
git commit -m "Initial commit: Complete workflow builder with CI/CD"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/workflow-builder.git
git branch -M main
git push -u origin main
```

### Step 2: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Value | Required |
|------------|-------|----------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | ✅ Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | ⚠️ Optional |

**How to get AWS credentials:**
```bash
# If you have AWS CLI configured
cat ~/.aws/credentials

# Or create new IAM user with these permissions:
# - AmazonS3FullAccess
# - AWSLambdaFullAccess
# - CloudFrontFullAccess
# - AmazonAPIGatewayAdministrator
# - IAMFullAccess (for creating roles)
# - CloudWatchLogsFullAccess
```

### Step 3: Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. GitHub Actions should be enabled by default
3. You'll see the available workflows

## 🔄 Available Workflows

### 1. **Deploy All (Complete Pipeline)** ⭐ Recommended
**File**: `.github/workflows/deploy-all.yml`

**Triggers:**
- Manual: Go to Actions → Deploy All → Run workflow
- Automatic: Push to `main` branch

**What it does:**
1. ✅ Provisions AWS infrastructure (Terraform)
2. ✅ Builds and deploys Lambda backend (with Docker)
3. ✅ Builds and deploys React frontend
4. ✅ Automatically creates .env files
5. ✅ Tests all endpoints
6. ✅ Provides deployment summary

**Usage:**
```bash
# Just push to main branch
git add .
git commit -m "Update application"
git push origin main

# Or run manually from GitHub Actions UI
```

### 2. **Deploy Infrastructure**
**File**: `.github/workflows/deploy-infrastructure.yml`

Deploys only the Terraform infrastructure (S3, Lambda, CloudFront, API Gateway)

### 3. **Deploy Backend**
**File**: `.github/workflows/deploy-backend.yml`

Deploys only the Lambda function with correct binaries

### 4. **Deploy Frontend**
**File**: `.github/workflows/deploy-frontend.yml`

Builds and deploys only the React frontend

### 5. **CI (Testing)**
**File**: `.github/workflows/ci.yml`

Runs on pull requests to validate code

## 🎯 First Deployment

### Option A: Automatic (Recommended)

1. Push your code to GitHub:
   ```bash
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Deploy infrastructure
   - Deploy backend
   - Deploy frontend
   - Test everything

3. Check the Actions tab to monitor progress

4. Get your URLs from the workflow output

### Option B: Manual Trigger

1. Go to **Actions** tab
2. Select **Deploy All (Complete Pipeline)**
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow**

## 📊 Monitoring Deployment

### View Workflow Progress

1. Go to **Actions** tab
2. Click on the running workflow
3. Click on each job to see detailed logs
4. Look for `::notice::` messages for important info

### Check Deployment Status

The workflow will output:
```
🎉 DEPLOYMENT SUCCESSFUL!
Frontend: https://xxxxx.cloudfront.net
API: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
API Docs: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/docs
```

## 🔧 Workflow Features

### Automatic Environment Configuration

✅ **No manual .env file creation needed!**

The workflows automatically:
- Fetch infrastructure outputs from AWS
- Create production .env files
- Inject correct API URLs
- Configure CORS settings

### Docker-based Lambda Build

✅ **No binary compatibility issues!**

The workflows use Docker to build Lambda packages:
```yaml
docker run --platform linux/amd64 --rm \
  --entrypoint "" \
  -v "$PWD":/var/task \
  -w /var/task \
  public.ecr.aws/lambda/python:3.11 \
  pip install -r requirements-lambda.txt -t package
```

This ensures correct x86_64 binaries for AWS Lambda.

### Intelligent Caching

- Node modules cached between runs
- Terraform state managed
- Docker layers cached

### Error Handling

- Validates infrastructure exists before deployment
- Tests API endpoints after deployment
- Provides clear error messages
- Automatic rollback on failure

## 🎨 Customization

### Change Deployment Region

Edit `.github/workflows/deploy-all.yml`:
```yaml
env:
  AWS_REGION: us-west-2  # Change this
```

### Skip Infrastructure Deployment

If infrastructure is already deployed:
```bash
# Run workflow manually with skip option
# Or edit the workflow file
```

### Add Custom Environment Variables

Edit the Lambda environment update step:
```yaml
--environment "Variables={
  APP_NAME='Your App Name',
  CUSTOM_VAR='value',
  ...
}"
```

## 🐛 Troubleshooting

### Workflow Fails: "AWS credentials not found"

**Solution**: Check GitHub Secrets are set correctly
```bash
# Verify secrets exist in:
# Settings → Secrets and variables → Actions
```

### Workflow Fails: "Terraform state locked"

**Solution**: 
1. Go to AWS S3 (if using remote state)
2. Delete the lock file
3. Re-run workflow

### Lambda Deployment Fails: "Package too large"

**Solution**: The Docker build should prevent this, but if it happens:
1. Check `requirements-lambda.txt` only has necessary packages
2. Remove development dependencies

### Frontend Build Fails: "API URL not set"

**Solution**: The workflow automatically fetches this. If it fails:
1. Ensure infrastructure is deployed first
2. Check AWS credentials have correct permissions

### CloudFront Not Updating

**Solution**: The workflow invalidates cache automatically. If needed:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_ID \
  --paths "/*"
```

## 📈 Deployment Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to main branch                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Deploy Infrastructure (Terraform)                   │
│  • Create S3 bucket                                          │
│  • Create CloudFront distribution                            │
│  • Create Lambda function                                    │
│  • Create API Gateway                                        │
│  • Extract outputs                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Deploy Backend (Lambda)                             │
│  • Build package with Docker (x86_64)                        │
│  • Upload to Lambda                                          │
│  • Update environment variables                              │
│  • Test API endpoint                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Deploy Frontend (S3 + CloudFront)                   │
│  • Fetch infrastructure details                              │
│  • Create production .env file                               │
│  • Build React app                                           │
│  • Upload to S3                                              │
│  • Invalidate CloudFront cache                               │
│  • Test frontend URL                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Deployment Summary                                  │
│  • Display all URLs                                          │
│  • Test all endpoints                                        │
│  • Confirm deployment success                                │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Best Practices

✅ **Never commit secrets to repository**
- Use GitHub Secrets for all sensitive data
- .env files are gitignored

✅ **Use least privilege IAM roles**
- Create dedicated IAM user for CI/CD
- Only grant necessary permissions

✅ **Rotate credentials regularly**
- Update GitHub Secrets periodically
- Use temporary credentials when possible

## 💰 Cost Optimization

The CI/CD pipeline is designed to minimize costs:

- **GitHub Actions**: 2,000 free minutes/month
- **AWS Resources**: Only pay for what you use
- **Caching**: Reduces build times and costs

**Estimated monthly cost**: $0-5 for CI/CD (within free tier)

## 📝 Workflow Outputs

Each workflow provides detailed outputs:

```
::notice::Infrastructure deployed successfully!
::notice::Frontend Bucket: workflow-builder-frontend-prod-xxxxx
::notice::API URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
::notice::CloudFront ID: EXXXXXXXXXX
::notice::✅ API is responding correctly
::notice::✅ Frontend is accessible (HTTP 200)
::notice::🎉 DEPLOYMENT SUCCESSFUL!
```

## 🎯 Next Steps After Setup

1. **Test the deployment**
   - Visit the frontend URL
   - Test workflow generation
   - Check API documentation

2. **Set up branch protection**
   - Require PR reviews
   - Require status checks to pass

3. **Add monitoring**
   - Set up CloudWatch alarms
   - Configure billing alerts

4. **Custom domain** (optional)
   - Register domain in Route53
   - Update CloudFront distribution

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## ✅ Checklist

- [ ] GitHub repository created
- [ ] AWS credentials added to GitHub Secrets
- [ ] OpenAI API key added (optional)
- [ ] Code pushed to main branch
- [ ] First workflow run successful
- [ ] Frontend accessible
- [ ] API responding
- [ ] Workflow generation working

---

**Need Help?** Check the workflow logs in the Actions tab for detailed error messages.

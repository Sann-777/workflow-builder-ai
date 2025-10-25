# Quick Start Guide

Get your Workflow Builder up and running in minutes!

## 🚀 Option 1: Local Development (Fastest)

```bash
# Navigate to project
cd workflow-builder-test

# Verify setup
./scripts/verify-setup.sh

# Start development servers
./scripts/local-dev.sh
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## ☁️ Option 2: Deploy to AWS

### Prerequisites
- AWS account configured (`aws configure`)
- All tools installed (run `./scripts/verify-setup.sh`)

### Deploy Everything

```bash
# One command deployment
./scripts/deploy-all.sh
```

This will:
1. Create AWS infrastructure (S3, CloudFront, Lambda, API Gateway)
2. Deploy backend to Lambda
3. Build and deploy frontend to S3
4. Provide you with public URLs

**Deployment time:** ~10-15 minutes

### Manual Step-by-Step

```bash
# 1. Deploy infrastructure
cd infrastructure
terraform init
terraform apply

# 2. Deploy backend
cd ../backend
./deploy-lambda.sh

# 3. Deploy frontend
cd ../frontend
npm install
npm run build
aws s3 sync dist/ s3://$(cd ../infrastructure && terraform output -raw frontend_bucket_name)/ --delete
```

## 🎨 Using the Application

### Create a Workflow Manually

1. **Drag nodes** from left sidebar to canvas
2. **Connect nodes** by dragging from output to input handles
3. **Click a node** to edit its properties in the right panel
4. **Validate** your workflow with the Validate button
5. **Export** as JSON for backup

### Generate with AI

1. Click **"AI Generate"** button
2. Enter description: 
   ```
   Create an order processing workflow with payment 
   verification, inventory check, and shipping
   ```
3. Click **"Generate Workflow"**
4. AI creates the complete workflow!

### Run Workflow

1. Click **"Run Workflow"**
2. Click **"Start Execution"**
3. Watch nodes execute with visual feedback

## 🔧 Configuration

### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key (optional)
```

### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit .env and set VITE_API_URL (default: http://localhost:8000)
```

## 📝 Common Commands

```bash
# Verify setup
./scripts/verify-setup.sh

# Local development
./scripts/local-dev.sh

# Full AWS deployment
./scripts/deploy-all.sh

# Deploy backend only
cd backend && ./deploy-lambda.sh

# Infrastructure commands
cd infrastructure
terraform init
terraform plan
terraform apply
terraform destroy  # Remove all AWS resources
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Python dependencies error
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### npm install fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### AWS deployment fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check Terraform state
cd infrastructure
terraform state list
```

## 📚 Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment details
- Review [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for overview

## 🎯 Key Features to Try

- ✅ Drag-and-drop workflow creation
- ✅ AI-powered workflow generation
- ✅ Property editing with color picker
- ✅ Workflow validation
- ✅ Export/Import workflows
- ✅ Execution simulation
- ✅ Real-time visual feedback

## 💡 Tips

1. **Use AI Generation**: Describe complex workflows in plain English
2. **Validate Often**: Catch errors early with the Validate button
3. **Export Regularly**: Save your workflows as JSON backups
4. **Check Logs**: Use browser console and API docs for debugging
5. **Start Simple**: Begin with basic workflows, then add complexity

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed docs
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
- Open an issue on GitHub
- Check AWS CloudWatch logs for backend errors

---

**Happy workflow building! 🎉**

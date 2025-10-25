# Workflow Builder - AI-Powered Workflow Designer

A full-stack interactive workflow builder application with React Flow frontend and FastAPI + PydanticAI backend, deployed on AWS using S3 and Lambda.

![Workflow Builder](https://img.shields.io/badge/React-18.2-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green) ![AWS](https://img.shields.io/badge/AWS-Lambda%20%2B%20S3-orange) ![Terraform](https://img.shields.io/badge/Terraform-1.6-purple)

## 🌟 Features

### Frontend (React Flow)
- **Interactive Canvas**: Drag-and-drop workflow builder with zoom, pan, and minimap
- **Custom Nodes**: 4 node types (Start, End, Process, Decision) with hover actions
- **Property Editor**: Right-side panel (20% width) for editing node properties:
  - Name (text input)
  - Description (textarea)
  - Category (dropdown)
  - Color (color picker with presets)
- **Workflow Validation**: Real-time validation with detailed error messages
- **Export/Import**: Download/upload workflows as JSON files
- **AI Generation**: Natural language workflow creation using PydanticAI
- **Execution Simulation**: Visual workflow execution with progress tracking
- **State Management**: Redux Toolkit with localStorage persistence

### Backend (FastAPI + PydanticAI)
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **AI Agent**: PydanticAI integration for intelligent workflow generation
- **Pydantic Models**: Type-safe Node, Edge, and Workflow models
- **Environment-based Configuration**: All settings via environment variables
- **CORS Support**: Configurable CORS for frontend integration
- **Lambda Compatible**: Runs on AWS Lambda via Mangum adapter

### Infrastructure (AWS)
- **Frontend**: S3 + CloudFront for global CDN distribution
- **Backend**: Lambda + API Gateway for serverless API
- **Infrastructure as Code**: Terraform for reproducible deployments
- **CI/CD**: GitHub Actions for automated deployments
- **Security**: HTTPS, security headers, IAM roles with least privilege

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [AWS Deployment](#aws-deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Usage Guide](#usage-guide)
- [Challenges Faced](#challenges-faced)
- [Future Enhancements](#future-enhancements)

## 🔧 Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **Python** 3.11+
- **AWS CLI** configured with credentials
- **Terraform** 1.6+
- **Git**

### AWS Account Setup
1. Create an AWS account
2. Configure AWS CLI:
   ```bash
   aws configure
   ```
3. Ensure you have permissions for:
   - S3, CloudFront, Lambda, API Gateway, IAM, CloudWatch

### Optional
- **OpenAI API Key** for AI workflow generation (can work without it using fallback logic)

## 🚀 Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workflow-builder-test
   ```

2. **Run development servers**
   ```bash
   chmod +x scripts/local-dev.sh
   ./scripts/local-dev.sh
   ```

   This will start:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

### Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your OpenAI API key (optional)

# Run server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

## ☁️ AWS Deployment

### Option 1: Automated Deployment (Recommended)

```bash
chmod +x scripts/deploy-all.sh
./scripts/deploy-all.sh
```

This script will:
1. Deploy infrastructure with Terraform
2. Package and deploy Lambda function
3. Build and deploy frontend to S3
4. Invalidate CloudFront cache
5. Display deployment URLs

### Option 2: Manual Deployment

#### Step 1: Deploy Infrastructure

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Review planned changes
terraform plan -var="openai_api_key=YOUR_API_KEY"

# Apply infrastructure
terraform apply -var="openai_api_key=YOUR_API_KEY"

# Save outputs
terraform output -json > outputs.json
```

#### Step 2: Deploy Backend

```bash
cd backend
chmod +x deploy-lambda.sh
./deploy-lambda.sh
```

#### Step 3: Deploy Frontend

```bash
cd frontend

# Get infrastructure outputs
FRONTEND_BUCKET=$(cd ../infrastructure && terraform output -raw frontend_bucket_name)
API_URL=$(cd ../infrastructure && terraform output -raw api_url)
CLOUDFRONT_ID=$(cd ../infrastructure && terraform output -raw cloudfront_distribution_id)

# Create production .env
cat > .env << EOF
VITE_API_URL=$API_URL
VITE_APP_NAME=Workflow Builder
VITE_APP_VERSION=1.0.0
VITE_ENABLE_AI_GENERATION=true
EOF

# Build and deploy
npm install
npm run build
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

### Access Your Application

After deployment, Terraform will output:
```
Frontend URL: https://xxxxx.cloudfront.net
API URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## 📁 Project Structure

```
workflow-builder-test/
├── backend/
│   ├── app/
│   │   └── main.py              # FastAPI application with PydanticAI
│   ├── lambda_handler.py        # Lambda entry point
│   ├── requirements.txt         # Python dependencies
│   ├── requirements-lambda.txt  # Lambda-specific dependencies
│   ├── Dockerfile              # Docker configuration
│   ├── .env.example            # Environment variables template
│   └── deploy-lambda.sh        # Lambda deployment script
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── CustomNode.jsx
│   │   │   ├── CustomEdge.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PropertyPanel.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── GenerateDialog.jsx
│   │   │   ├── ExecutionDialog.jsx
│   │   │   └── ExecutionMonitor.jsx
│   │   ├── store/
│   │   │   └── store.js        # Redux store
│   │   ├── App.jsx             # Main application
│   │   ├── App.css             # Styles
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── infrastructure/
│   ├── main.tf                 # Main Terraform configuration
│   ├── providers.tf            # Provider configuration
│   ├── variables.tf            # Input variables
│   └── outputs.tf              # Output values
├── .github/
│   └── workflows/
│       ├── deploy-infrastructure.yml
│       ├── deploy-backend.yml
│       ├── deploy-frontend.yml
│       └── ci.yml
├── scripts/
│   ├── deploy-all.sh           # Full deployment script
│   └── local-dev.sh            # Local development script
├── .gitignore
└── README.md
```

## 📚 API Documentation

### Endpoints

#### `GET /`
Health check endpoint
```json
{
  "message": "Workflow AI API is running",
  "app_name": "Workflow Builder API",
  "version": "1.0.0",
  "ai_enabled": true
}
```

#### `POST /generate_workflow`
Generate workflow from natural language description

**Request:**
```json
{
  "description": "Create an order processing workflow with payment verification and shipping"
}
```

**Response:**
```json
{
  "nodes": [
    {
      "id": "uuid",
      "type": "custom",
      "position": {"x": 100, "y": 100},
      "data": {
        "name": "Start",
        "description": "Begin order processing",
        "category": "General",
        "color": "#4caf50",
        "nodeType": "start"
      }
    }
  ],
  "edges": [
    {
      "id": "uuid",
      "source": "node1",
      "target": "node2",
      "type": "default"
    }
  ]
}
```

### Interactive API Docs
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔐 Environment Variables

### Backend (.env)
```bash
# Application
APP_NAME=Workflow Builder API
APP_VERSION=1.0.0
DEBUG=false

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-cloudfront-url.cloudfront.net

# AI Configuration (Optional)
OPENAI_API_KEY=sk-your-api-key
AI_MODEL=gpt-4

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=Workflow Builder
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_GENERATION=true
VITE_ENABLE_EXPORT_PNG=true
VITE_ENABLE_VALIDATION=true

# Debug
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

1. **CI (Continuous Integration)**
   - Runs on pull requests
   - Tests backend imports
   - Builds frontend
   - Validates Terraform

2. **Deploy Infrastructure**
   - Triggered manually or on infrastructure changes
   - Runs Terraform plan/apply
   - Saves outputs as artifacts

3. **Deploy Backend**
   - Triggered on backend changes or after infrastructure deployment
   - Packages Lambda function with dependencies
   - Updates Lambda code and configuration

4. **Deploy Frontend**
   - Triggered on frontend changes or after backend deployment
   - Builds React app with production API URL
   - Deploys to S3 and invalidates CloudFront cache

### Required GitHub Secrets
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
OPENAI_API_KEY (optional)
```

## 📖 Usage Guide

### Creating a Workflow Manually

1. **Add Nodes**: Drag node types from the left sidebar to the canvas
2. **Connect Nodes**: Click and drag from a node's output handle to another node's input handle
3. **Edit Properties**: Click a node to select it, then edit properties in the right panel
4. **Validate**: Click "Validate" to check for errors
5. **Export**: Click "Export" to download as JSON

### Generating Workflow with AI

1. Click "AI Generate" button
2. Enter a natural language description:
   ```
   Create a customer onboarding workflow with email verification,
   document upload, and approval steps
   ```
3. Click "Generate Workflow"
4. The AI will create a complete workflow based on your description

### Running Workflow Execution

1. Click "Run Workflow" button
2. Click "Start Execution" in the dialog
3. Watch nodes execute in sequence with visual feedback
4. View execution log and progress

### Import/Export Workflows

**Export:**
- Click "Export" → Choose "Download File" or "Copy JSON Code"

**Import:**
- Click "Import" → Choose "Upload File" or "Paste JSON Code"

## 🎯 Challenges Faced

### 1. **PydanticAI Integration**
**Challenge**: PydanticAI was a new library with limited documentation and examples.

**Solution**: 
- Studied the library's source code and type hints
- Implemented fallback logic for when AI is unavailable
- Created a mock workflow generator for development without API keys

### 2. **Lambda Cold Starts**
**Challenge**: Lambda functions had slow cold starts with large dependencies.

**Solution**:
- Created separate `requirements-lambda.txt` with minimal dependencies
- Excluded development-only packages (uvicorn, python-dotenv)
- Used Lambda layers for common dependencies (considered but not implemented)

### 3. **React Flow State Management**
**Challenge**: Synchronizing React Flow state with Redux while maintaining performance.

**Solution**:
- Used Redux for persistent state (nodes, edges)
- Used local React state for UI interactions (hover, selection)
- Implemented localStorage for workflow persistence

### 4. **CORS Configuration**
**Challenge**: Managing CORS across local development and production environments.

**Solution**:
- Environment-based CORS configuration in backend
- Dynamic CORS origins from Terraform outputs
- Wildcard for development, specific origins for production

### 5. **CloudFront Caching**
**Challenge**: Frontend updates not reflecting due to CloudFront cache.

**Solution**:
- Implemented cache invalidation in deployment scripts
- Set appropriate cache headers for static assets vs. HTML
- Added invalidation step in GitHub Actions

### 6. **Terraform State Management**
**Challenge**: Managing Terraform state for team collaboration.

**Solution**:
- Used local state for this project (acceptable for single developer)
- Documented need for S3 backend for production teams
- Added `.terraform/` to `.gitignore`

### 7. **Environment Variable Management**
**Challenge**: Different environment variables needed for local vs. production.

**Solution**:
- Created `.env.example` templates for both frontend and backend
- Used Terraform to inject production values
- GitHub Actions dynamically creates `.env` files during deployment

### 8. **Node Type Validation**
**Challenge**: Ensuring workflow validity (start nodes, decision node edges, etc.).

**Solution**:
- Implemented comprehensive validation function in TopBar component
- Real-time validation with detailed error messages
- Visual feedback for validation errors

## 🚀 Future Enhancements

### Planned Features
- [ ] **Export as PNG/SVG**: Visual export of workflow diagrams
- [ ] **Round-trip AI Editing**: AI refines user-modified workflows
- [ ] **Workflow Templates**: Pre-built workflow templates library
- [ ] **Collaboration**: Real-time multi-user editing with WebSockets
- [ ] **Version Control**: Workflow versioning and history
- [ ] **Custom Node Types**: User-defined node types with custom logic
- [ ] **Workflow Execution**: Actual workflow execution (not just simulation)
- [ ] **Integration Hub**: Connect to external services (Slack, Email, etc.)
- [ ] **Analytics Dashboard**: Workflow execution analytics and metrics
- [ ] **Dark Mode**: Theme toggle for better UX

### Infrastructure Improvements
- [ ] **S3 Backend**: Remote Terraform state storage
- [ ] **Custom Domain**: Route53 + ACM for custom domain
- [ ] **WAF**: Web Application Firewall for security
- [ ] **Monitoring**: CloudWatch dashboards and alarms
- [ ] **Auto-scaling**: Lambda concurrency limits and provisioned capacity
- [ ] **Multi-region**: Global deployment for low latency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **React Flow**: Excellent workflow visualization library
- **FastAPI**: Modern, fast Python web framework
- **PydanticAI**: Type-safe AI agent framework
- **Material-UI**: Beautiful React component library
- **Terraform**: Infrastructure as Code made easy
- **AWS**: Reliable cloud infrastructure

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using React Flow, FastAPI, PydanticAI, and AWS**

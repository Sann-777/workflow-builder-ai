# Workflow Builder - AI-Powered Workflow Designer

An interactive workflow builder with React Flow frontend and FastAPI + PydanticAI backend. Design workflows manually or generate them using AI.

## 🌐 Live Demo

**Frontend**: https://d1wjslb3r1nv2d.cloudfront.net  
**Backend API**: https://dv4efwcese.execute-api.us-east-1.amazonaws.com/prod  
**API Documentation**: https://dv4efwcese.execute-api.us-east-1.amazonaws.com/prod/docs

## 📸 Screenshots & Demo

### Main Interface
The workflow builder features a clean, intuitive interface with:
- **Left Sidebar**: Draggable node types (Start, End, Process, Decision)
- **Canvas**: Interactive workflow design area with zoom/pan
- **Right Panel**: Property editor for selected nodes
- **Top Bar**: Actions (Export, Import, AI Generate, Run)

### Feature Demonstrations

#### 1. Manual Workflow Creation
Create workflows by dragging nodes from the sidebar and connecting them:
- Drag nodes onto canvas
- Click and drag between nodes to create connections
- Click nodes to edit properties in right panel
- Real-time validation feedback

#### 2. Export Workflow
Export your workflow as JSON:
1. Click **"Export JSON"** button in top bar
2. File downloads as `workflow-{timestamp}.json`
3. Contains complete workflow structure (nodes + edges)

**Example Export:**
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "start",
      "position": {"x": 100, "y": 100},
      "data": {
        "name": "Start Order",
        "description": "Begin order processing",
        "category": "General",
        "color": "#4caf50"
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "type": "smoothstep"
    }
  ]
}
```

#### 3. Import Workflow
Restore previously saved workflows:
1. Click **"Import JSON"** button
2. Select JSON file from your computer
3. Workflow loads instantly into canvas
4. All nodes, connections, and properties restored

#### 4. AI Workflow Generation
Generate workflows from natural language:
1. Click **"Generate with AI"** button
2. Enter description: *"Create an order processing workflow with payment verification and shipping"*
3. Click **"Generate"**
4. AI creates complete workflow structure
5. Edit generated workflow as needed

**Example AI Input:**
```
"Create an order processing workflow with payment verification and shipping"
```

**AI Output:**
- Start node: "Start Order"
- Process node: "Verify Payment"
- Decision node: "Payment Valid?"
- Process node: "Ship Order"
- End node: "Complete"
- All nodes properly connected

#### 5. Workflow Validation
Real-time validation with visual feedback:
- ✅ **Valid**: Green checkmark, workflow can run
- ❌ **Invalid**: Red error messages with details
  - "Start node cannot have incoming edges"
  - "Decision node must have exactly 2 outgoing edges"
  - "End node cannot have outgoing edges"

#### 6. Workflow Execution
Simulate workflow execution:
1. Click **"Run Workflow"** button
2. Nodes highlight in sequence
3. Execution path visualized
4. Results shown in dialog

#### 7. Node Property Editing
Edit any node's properties:
- **Name**: Text input (e.g., "Process Payment")
- **Description**: Textarea (e.g., "Verify credit card and process transaction")
- **Category**: Dropdown (General, Finance, Shipping, etc.)
- **Color**: Color picker (visual customization)
- **Save/Cancel**: Persist or discard changes

### API Testing

#### Health Check
```bash
curl https://dv4efwcese.execute-api.us-east-1.amazonaws.com/prod/
```

**Response:**
```json
{
  "message": "Workflow Builder API is running",
  "app_name": "Workflow Builder API",
  "version": "1.0.0",
  "ai_enabled": false,
  "ai_model": null
}
```

#### Generate Workflow via API
```bash
curl -X POST https://dv4efwcese.execute-api.us-east-1.amazonaws.com/prod/generate_workflow \
  -H "Content-Type: application/json" \
  -d '{"description":"order processing workflow with payment"}'
```

**Response:**
```json
{
  "nodes": [
    {"id": "...", "type": "start", "position": {...}, "data": {...}},
    {"id": "...", "type": "process", "position": {...}, "data": {...}},
    {"id": "...", "type": "decision", "position": {...}, "data": {...}},
    {"id": "...", "type": "end", "position": {...}, "data": {...}}
  ],
  "edges": [
    {"id": "...", "source": "...", "target": "...", "type": "smoothstep"}
  ]
}
```

#### Interactive API Documentation
Visit: https://dv4efwcese.execute-api.us-east-1.amazonaws.com/prod/docs

Features:
- Swagger UI interface
- Try API endpoints directly in browser
- View request/response schemas
- Test workflow generation with different inputs

## ✨ Features

### Frontend (React Flow + Material-UI)
- **Interactive Workflow Canvas**
  - Drag-and-drop node creation from left sidebar
  - 4 node types: Start, End, Process, Decision
  - Custom nodes with hover actions (delete, play)
  - Zoom, pan, and mini-map for navigation
  
- **Node Property Editor**
  - Right-side panel (20% width) for editing node properties
  - Fields: Name (text), Description (textarea), Category (dropdown), Color (color picker)
  - Save/Cancel buttons with validation
  
- **Workflow Validation**
  - Start Node: No incoming edges allowed
  - Decision Node: Exactly 2 outgoing edges required
  - Real-time validation feedback
  
- **Export & Import**
  - Export workflows as JSON files
  - Import JSON files to restore workflows
  - Workflow data persisted in localStorage
  
- **AI Workflow Generation**
  - "Generate with AI" button in top bar
  - Enter natural language description
  - Backend generates complete workflow structure
  - Automatically renders in canvas

- **Workflow Execution**
  - "Run Workflow" button to simulate execution
  - Visual feedback with node highlighting
  - Step-by-step execution monitoring

### Backend (FastAPI + PydanticAI)
- **RESTful API**
  - `/` - Health check endpoint
  - `/generate_workflow` - AI workflow generation
  - `/docs` - Interactive API documentation (Swagger UI)
  
- **AI-Powered Generation**
  - Uses PydanticAI for structured output
  - Converts natural language to workflow JSON
  - Generates nodes, edges, and connections
  - Validates workflow structure

- **Data Models**
  - Pydantic models for Node, Edge, Workflow
  - Type-safe API responses
  - Automatic validation

### State Management
- Redux Toolkit for global state
- localStorage persistence
- Undo/Redo support
- Real-time updates

## 🚀 Deployment

### Architecture
- **Frontend**: AWS S3 + CloudFront CDN
- **Backend**: AWS Lambda + API Gateway
- **Infrastructure**: Terraform (Infrastructure as Code)
- **CI/CD**: GitHub Actions for automated deployment

### Deployment Steps

1. **Add GitHub Secrets** (for CI/CD):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `OPENAI_API_KEY` (optional)

2. **Deploy via GitHub Actions**:
   ```bash
   git push origin main
   ```
   GitHub Actions will automatically deploy everything.

3. **Deploy Locally**:
   ```bash
   ./scripts/deploy-all.sh
   ```

4. **Destroy Resources**:
   ```bash
   ./scripts/destroy-all.sh
   ```

### Automatic Cleanup on Failure
If GitHub Actions deployment fails, resources are automatically cleaned up to prevent orphaned AWS resources.

## 💻 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- AWS CLI configured
- Terraform 1.6+

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Workflow Builder
VITE_APP_VERSION=1.0.0
VITE_ENABLE_AI_GENERATION=true
VITE_ENABLE_EXPORT_PNG=false
VITE_ENABLE_VALIDATION=true
EOF

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional)
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4
DEBUG=true
EOF

# Start development server
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000

### Quick Start Script

```bash
./scripts/local-dev.sh
```

This starts both frontend and backend in development mode.

## 📖 Usage

### Manual Workflow Creation

1. **Add Nodes**: Drag node types from left sidebar to canvas
2. **Connect Nodes**: Click and drag from one node's edge to another
3. **Edit Properties**: Click a node to open property panel on the right
4. **Validate**: Check validation errors in real-time
5. **Export**: Click "Export JSON" to download workflow
6. **Import**: Click "Import JSON" to load saved workflow

### AI Workflow Generation

1. Click **"Generate with AI"** button in top bar
2. Enter workflow description in natural language
   - Example: "Create an order processing workflow with payment verification"
3. Click **"Generate"**
4. AI generates complete workflow structure
5. Edit generated workflow as needed

### Workflow Execution

1. Design or generate a workflow
2. Click **"Run Workflow"** button
3. Watch nodes highlight as execution progresses
4. View execution results in dialog

### Export & Import

**Export Workflow:**
```bash
# Click "Export JSON" button
# File downloads as: workflow-{timestamp}.json
```

**Import Workflow:**
```bash
# Click "Import JSON" button
# Select previously exported JSON file
# Workflow loads into canvas
```

## 🏗️ Project Structure

```
workflow-builder-test/
├── frontend/                   # React Flow application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── CustomNode.jsx
│   │   │   ├── CustomEdge.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PropertyPanel.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── GenerateDialog.jsx
│   │   │   ├── ExecutionDialog.jsx
│   │   │   └── ExecutionMonitor.jsx
│   │   ├── store/
│   │   │   └── store.js       # Redux Toolkit store
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                    # FastAPI + PydanticAI
│   ├── app/
│   │   └── main.py            # API endpoints
│   ├── lambda_handler.py      # AWS Lambda handler
│   ├── requirements.txt
│   └── requirements-lambda.txt
├── infrastructure/             # Terraform IaC
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── providers.tf
├── .github/workflows/
│   └── deploy.yml             # CI/CD pipeline
├── scripts/
│   ├── deploy-all.sh          # Deploy everything
│   ├── destroy-all.sh         # Destroy all resources
│   └── local-dev.sh           # Local development
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **React Flow** - Workflow visualization
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **Vite** - Build tool
- **Axios** - HTTP client

### Backend
- **FastAPI** - Web framework
- **PydanticAI** - AI agent framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **OpenAI** - AI model (optional)

### Infrastructure
- **AWS S3** - Frontend hosting
- **AWS CloudFront** - CDN
- **AWS Lambda** - Serverless backend
- **AWS API Gateway** - API management
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD

## 📝 API Documentation

### Health Check
```bash
GET /
```

Response:
```json
{
  "message": "Workflow Builder API is running",
  "app_name": "Workflow Builder API",
  "version": "1.0.0",
  "ai_enabled": false,
  "ai_model": null
}
```

### Generate Workflow
```bash
POST /generate_workflow
Content-Type: application/json

{
  "description": "Create an order processing workflow"
}
```

Response:
```json
{
  "nodes": [
    {
      "id": "uuid",
      "type": "start",
      "position": {"x": 100, "y": 100},
      "data": {
        "name": "Start",
        "description": "Start node",
        "category": "General",
        "color": "#4caf50",
        "type": "start"
      }
    }
  ],
  "edges": [
    {
      "id": "uuid",
      "source": "node1",
      "target": "node2",
      "type": "smoothstep"
    }
  ]
}
```

## 🔒 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://your-api-url.com/prod
VITE_APP_NAME=Workflow Builder
VITE_APP_VERSION=1.0.0
VITE_ENABLE_AI_GENERATION=true
VITE_ENABLE_EXPORT_PNG=false
VITE_ENABLE_VALIDATION=true
```

### Backend (.env)
```env
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4
DEBUG=false
ALLOWED_ORIGINS=https://your-frontend-url.com
ENVIRONMENT=production
```

## 🧪 Testing

### Test API Locally
```bash
curl http://localhost:8000/
```

### Test Workflow Generation
```bash
curl -X POST http://localhost:8000/generate_workflow \
  -H "Content-Type: application/json" \
  -d '{"description":"order processing workflow"}'
```

### Test Deployed API
```bash
curl https://dv4efwcese.execute-api.us-east-1.amazonaws.com/prod/
```

## 📊 Validation Rules

- **Start Node**: Must have no incoming edges
- **End Node**: Must have no outgoing edges
- **Decision Node**: Must have exactly 2 outgoing edges
- **Process Node**: Can have any number of edges
- **No Cycles**: Workflows must be acyclic (DAG)

## 🎨 Node Types

| Type | Color | Description | Validation |
|------|-------|-------------|------------|
| Start | Green (#4caf50) | Workflow entry point | No incoming edges |
| End | Red (#f44336) | Workflow exit point | No outgoing edges |
| Process | Blue (#2196f3) | Processing step | Any edges |
| Decision | Orange (#ff9800) | Conditional branch | Exactly 2 outgoing |

## 💰 AWS Cost Estimate

**Monthly costs** (assuming moderate usage):
- S3: ~$0.50
- CloudFront: $5-20
- Lambda: $1-10
- API Gateway: $1-5

**Total**: $10-40/month

**GitHub Actions**: Free (2,000 minutes/month)

## 🐛 Troubleshooting

### Frontend Not Loading
```bash
# Check CloudFront distribution
aws cloudfront list-distributions

# Invalidate cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### API Returning 404
```bash
# Check Lambda function
aws lambda list-functions

# View logs
aws logs tail /aws/lambda/workflow-builder-prod-api --follow
```

### Deployment Failed
```bash
# Cleanup resources
./scripts/destroy-all.sh

# Redeploy
./scripts/deploy-all.sh
```

### GitHub Actions Cleanup
If deployment fails in GitHub Actions, resources are automatically cleaned up. Check the "Cleanup Failed Deployment" job in the Actions tab.

## 📚 Additional Resources

- [React Flow Documentation](https://reactflow.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PydanticAI Documentation](https://ai.pydantic.dev/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Built as a full-stack assignment demonstrating React Flow, PydanticAI, and AWS deployment.

---

**Live Demo**: https://d1wjslb3r1nv2d.cloudfront.net  
**API**: https://dv4efwcese.execute-api.us-east-1.amazonaws.com/prod

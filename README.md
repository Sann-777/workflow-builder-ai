# Workflow Builder AI

An **interactive, AI-powered workflow designer** built with **React Flow**, **FastAPI**, and **PydanticAI** which is deployed on **AWS** using **S3, IAM, CloudFront, Lambda, API Gateway, and DynamoDB**.
It allows users to **visually design workflows** or **automatically generate them** from a descriptions using AI.

---

## Project Overview

The goal of this project is to create a **flexible workflow builder** that merges **manual control** with **AI assistance**.
Users can drag and drop nodes, connect them, edit details, and even generate entire workflows automatically through text prompts using the **AI Generating** feature.

It demonstrates a **complete full-stack deployment** using AWS services, Terraform, and CI/CD automation with github actions, ensuring that every push deliever the updates to production environment.

---

## 🌐 Live Demo

- **FRONTEND**: https://workflowbuilder-app.netlify.app/
- **BACKEND API**: https://workflowbuilder-api.netlify.app/

---

## Architecture Summary

| Layer                | Stack / Tools                                                  |
| :------------------- | :------------------------------------------------------------- |
| **Frontend**         | React, React Flow, Redux Toolkit, Vite                         |
| **Backend**          | FastAPI, PydanticAI                                            |
| **Infrastructure**   | AWS (S3, CloudFront, Lambda, API Gateway, DynamoDB, Terraform) |
| **AI Engine**        | PydanticAI Workflow Generator                                  |
| **State Management** | Redux Toolkit + LocalStorage                                   |
| **Terraform State**  | Stored in S3 (state) + DynamoDB (locking)                      |
| **CI/CD**            | GitHub Actions (auto-deploy updates)                           |

---

## Deployment

| Component             | Platform                 | Description                                          |
| :-------------------- | :----------------------- | :--------------------------------------------------- |
| **Frontend**          | AWS S3 + CloudFront      | Static React app deployed with CDN                   |
| **Backend API**       | AWS Lambda + API Gateway | FastAPI app running serverlessly                     |
| **State Persistence** | S3 + DynamoDB            | Terraform backend for safe updates                   |
| **Redirect**          | Netlify                  | Redirects clean Netlify URL to AWS CloudFront domain |

*Architecture Diagram (created genearted by the Workflow Builder itself using AI)*

```
![Architecture](user-assets/workflow-builder-ai/project_workflow.png)
```

---

## Core Features

### Drag-and-Drop Workflow Canvas

* Node types: **Start**, **Process**, **Decision**, **End**
* Zoom, pan, and mini-map for easy navigation

### Custom Node Editor

* Edit name, description, category, and color
* Real-time updates with validation

### Validation Rules

* **Start Node** → No incoming edges
* **Decision Node** → Exactly 2 outgoing edges
* **End Node** → No outgoing edges

### Export & Import

* Save workflows as JSON
* Import and restore full workflows

*Export/Import Screenshots*

```
![Export Workflow](user-assets/workflow-builder-ai/export.png)
![Import Workflow](user-assets/workflow-builder-ai/import.png)
```

### AI Workflow Generation

* Describe any workflow
* FastAPI + PydanticAI backend returns structured graph JSON
* Auto-renders in React Flow canvas

*AI Generation Screenshots*

```
![AI Generate](user-assets/workflow-builder-ai/ai_generate.png)
![AI Workflow](user-assets/workflow-builder-ai/ai_workflow.png)
```

### Workflow Execution

* Simulates step-by-step execution
* Highlights active nodes dynamically

*Execution Screenshots*

```
![Execution](user-assets/workflow-builder-ai/execution.png)
![Execution Status](user-assets/workflow-builder-ai/execution_status.png)
```

---

## Local Development

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs at ➜ [http://localhost:5173](http://localhost:5173)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs at ➜ [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## AWS Infrastructure Setup (Terraform)

### Structure

```
infrastructure/
├── backend-setup/
│   ├── main.tf
│   ├── providers.tf
│   └── README.md
├── main.tf
├── outputs.tf
├── providers.tf
└── variables.tf
```

### Steps

1. **Initialize Terraform Backend**

   ```bash
   ./scripts/setup-backend.sh
   ```
2. **Deploy Resources**

   ```bash
   ./scripts/deploy-all.sh
   ```
3. **Destroy Resources**

   ```bash
   ./scripts/destroy-all.sh
   ```

### Persistent State

* **S3 Bucket:** Stores Terraform state
* **DynamoDB Table:** Handles state locking
* Ensures that **CI/CD updates existing AWS resources** instead of recreating them.

---

## Project Structure

```
.
├── backend/
│   ├── app/main.py
│   ├── lambda_handler.py
│   ├── requirements*.txt
│   └── lambda_deployment.zip
├── frontend/
│   ├── src/components/
│   ├── src/store/
│   ├── App.jsx
│   └── vite.config.js
├── infrastructure/
│   ├── backend-setup/
│   ├── main.tf
│   ├── outputs.tf
│   └── providers.tf
├── scripts/
│   ├── deploy-all.sh
│   ├── destroy-all.sh
│   └── setup-backend.sh
└── README.md
```

---

## API Endpoints

### Health Check

```bash
GET /
```

**Response:**

```json
{"message": "Workflow Builder API is running"}
```

### Generate Workflow

```bash
POST /generate_workflow
{
  "description": "Create a shopping cart workflow"
}
```

**Response:**

```json
{
  "nodes": [...],
  "edges": [...]
}
```

Docs: `https://vhvkxmss40.execute-api.us-east-1.amazonaws.com/prod/docs`

---

## What This Project Demonstrates

* Frontend + backend integration with **React Flow** and **FastAPI**
* **AI-powered** workflow generation via **PydanticAI**
* **Infrastructure-as-Code (IaC)** using Terraform
* **AWS Serverless deployment** (S3, CloudFront, Lambda, API Gateway)
* **Persistent CI/CD** through Terraform state management
* **Clean code organization** for production-ready deployment

---

## Future Enhancements

* AI-assisted **editing** of existing workflows
* Export workflows as **PNG/SVG**
* Add **authentication & user accounts**
* Convert deployment to **EKS or ECS** for scalability

---

## 👤 Author

Developed by **Sandeep Singh**

> A full-stack project demonstrating AI-driven workflow automation, AWS deployment, and infrastructure management using Terraform.
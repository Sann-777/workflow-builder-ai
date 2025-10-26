# Workflow Builder AI

An **interactive, AI-powered workflow designer** built with **React Flow**, **FastAPI**, and **PydanticAI** which is deployed on **AWS** using **S3, IAM, CloudFront, Lambda, API Gateway, and DynamoDB**.
It allows users to **visually design workflows** or **automatically generate them** from a descriptions using AI.

---

## 📚 Table of Contents
- [Project Overview](#project-overview)
- [Live Demo](#🌐-live-demo)
- [Architecture Summary](#architecture-summary)
- [Deployment](#deployment)
- [Core Features](#core-features)
- [Local Development](#local-development)
- [AWS Infrastructure Setup (Terraform)](#aws-infrastructure-setup-terraform)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [What This Project Demonstrates](#what-this-project-demonstrates)
- [Future Enhancements](#future-enhancements)
- [Author](#👤-author)

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
![Architecture](./screenshots/project_workflow.png)
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
![Export Workflow](./screenshots/export.png)
![Import Workflow](./screenshots/import.png)
```

### AI Workflow Generation

* Describe any workflow
* FastAPI + PydanticAI backend returns structured graph JSON
* Auto-renders in React Flow canvas

*AI Generation Screenshots*

```

![AI Feature](./screenshots/ai_generate.png)
![AI Generated Workflow](./screenshots/ai_workflow.png)
```

### Workflow Execution

* Simulates step-by-step execution
* Highlights active nodes dynamically

*Execution Screenshots*

```
![Execution](./screenshots/execution.png)
![Execution Status](./screenshots/execution_status.png)
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
├── .github/
│   └── workflows/ 
│       └── deploy.yml
├── backend/
│   ├── app/main.py
│   ├── lambda_handler.py
│   ├── requirements*.txt
├── frontend/
│   ├── src/components/
│   ├── src/store/
│   ├── App.css
│   ├── App.jsx
│   └── vite.config.js
├── infrastructure/
│   ├── backend-setup/
│   ├── main.tf
│   ├── outputs.tf
│   └── providers.tf
│   └── variables.tf
├── screenshots/
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
  "description": "Create a shopping cart workflow vertically"
}
```

**Response:**

```json
{
  "nodes": [
    {
      "id": "start-node",
      "type": "custom",
      "position": {
        "x": 45,
        "y": 195
      },
      "data": {
        "name": "Start",
        "description": "Begin the shopping cart process",
        "category": "Workflow",
        "color": "#4caf50",
        "nodeType": "start",
        "type": "start"
      },
      "width": 212,
      "height": 99,
      "selected": false,
      "positionAbsolute": {
        "x": 45,
        "y": 195
      },
      "dragging": false
    },
    {
      "id": "add-to-cart",
      "type": "custom",
      "position": {
        "x": 100,
        "y": 350
      },
      "data": {
        "name": "Add to Cart",
        "description": "User adds items to the shopping cart",
        "category": "Process",
        "color": "#2196f3",
        "nodeType": "process",
        "type": "process"
      },
      "width": 238,
      "height": 99
    },
    {
      "id": "view-cart",
      "type": "custom",
      "position": {
        "x": 150,
        "y": 510
      },
      "data": {
        "name": "View Cart",
        "description": "User views items in the shopping cart",
        "category": "Process",
        "color": "#2196f3",
        "nodeType": "process",
        "type": "process"
      },
      "width": 242,
      "height": 99,
      "selected": false,
      "positionAbsolute": {
        "x": 150,
        "y": 510
      },
      "dragging": false
    },
    {
      "id": "checkout-decision",
      "type": "custom",
      "position": {
        "x": 195,
        "y": 660
      },
      "data": {
        "name": "Checkout?",
        "description": "User decides whether to proceed to checkout",
        "category": "Decision",
        "color": "#ff9800",
        "nodeType": "decision",
        "type": "decision"
      },
      "width": 286,
      "height": 99,
      "selected": false,
      "positionAbsolute": {
        "x": 195,
        "y": 660
      },
      "dragging": false
    },
    {
      "id": "checkout-process",
      "type": "custom",
      "position": {
        "x": 30,
        "y": 855
      },
      "data": {
        "name": "Checkout",
        "description": "User proceeds to checkout",
        "category": "Process",
        "color": "#2196f3",
        "nodeType": "process",
        "type": "process"
      },
      "width": 181,
      "height": 99,
      "selected": false,
      "positionAbsolute": {
        "x": 30,
        "y": 855
      },
      "dragging": false
    },
    {
      "id": "end-node",
      "type": "custom",
      "position": {
        "x": 420,
        "y": 1005
      },
      "data": {
        "name": "End",
        "description": "End of the shopping cart process",
        "category": "Workflow",
        "color": "#f44336",
        "nodeType": "end",
        "type": "end"
      },
      "width": 216,
      "height": 99,
      "selected": true,
      "positionAbsolute": {
        "x": 420,
        "y": 1005
      },
      "dragging": false
    }
  ],
  "edges": [
    {
      "id": "edge-start-to-add-to-cart",
      "source": "start-node",
      "target": "add-to-cart",
      "type": "smoothstep"
    },
    {
      "id": "edge-add-to-cart-to-view-cart",
      "source": "add-to-cart",
      "target": "view-cart",
      "type": "smoothstep"
    },
    {
      "id": "edge-view-cart-to-checkout-decision",
      "source": "view-cart",
      "target": "checkout-decision",
      "type": "smoothstep"
    },
    {
      "id": "edge-checkout-decision-to-checkout-process-yes",
      "source": "checkout-decision",
      "target": "checkout-process",
      "type": "smoothstep"
    },
    {
      "id": "edge-checkout-decision-to-end-no",
      "source": "checkout-decision",
      "target": "end-node",
      "type": "smoothstep"
    },
    {
      "id": "edge-checkout-process-to-end",
      "source": "checkout-process",
      "target": "end-node",
      "type": "smoothstep"
    }
  ],
  "version": "1.0",
  "exportedAt": "2025-10-26T15:49:32.418Z"
}
```

![Shopping Cart Worklow](./screenshots/shopping_cart.png)

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
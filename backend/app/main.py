# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
import os
import json

# Optional AI agent
try:
    from pydantic_ai import Agent
    AI_AVAILABLE = True
except Exception:
    Agent = None
    AI_AVAILABLE = False

# Load environment in local/dev if .env exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# Environment variables
APP_NAME = os.getenv("APP_NAME", "Workflow Builder API")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4")

# Use root_path for API Gateway stage
app = FastAPI(title=APP_NAME, version=APP_VERSION, debug=DEBUG, root_path="/prod")

# CORS configuration (env-driven; default "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# --- Pydantic Models ---
class NodeModel(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Optional[str]]

class EdgeModel(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = "default"

class WorkflowModel(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]

class WorkflowRequest(BaseModel):
    description: str = Field(..., min_length=3)

# --- AI agent configuration ---
USE_AI = bool(OPENAI_API_KEY and AI_AVAILABLE)
workflow_agent = None

if USE_AI:
    try:
        workflow_agent = Agent(
            model=AI_MODEL,
            result_type=WorkflowModel,
            system_prompt=(
                "You are a workflow generator assistant. Create workflow nodes and edges based on the user's description. "
                "Use node types: start, end, process, decision. "
                "Each node should have: id (unique string), type (must be 'custom'), position (x, y coordinates), "
                "and data (with name, description, category, color, and nodeType fields). "
                "Position nodes horizontally with 200px spacing. Start at x=100, y=100. "
                "Node colors: start=#4caf50, end=#f44336, process=#2196f3, decision=#ff9800. "
                "Return a valid WorkflowModel with nodes and edges arrays."
            ),
        )
    except Exception as e:
        USE_AI = False
        print(f"Failed to initialize AI agent: {e}")

# --- Helper functions ---
def _make_node(node_type: str, x=0, y=0, name: Optional[str] = None):
    """Create a node with proper structure"""
    nid = str(uuid.uuid4())
    colors = {
        "start": "#4caf50",
        "end": "#f44336",
        "process": "#2196f3",
        "decision": "#ff9800",
    }
    return NodeModel(
        id=nid,
        type=node_type,
        position={"x": x, "y": y},
        data={
            "name": name or node_type.capitalize(),
            "description": f"{node_type.capitalize()} node",
            "category": "General",
            "color": colors.get(node_type, "#2196f3"),
            "type": node_type,
        }
    )

def generate_mock_workflow(description: str) -> WorkflowModel:
    """
    Generate a simple workflow based on description keywords.
    This is a fallback when AI is not available.
    """
    desc_lower = description.lower()
    
    # Determine workflow complexity based on description
    has_decision = any(word in desc_lower for word in ["decision", "if", "choice", "branch", "condition"])
    has_multiple_steps = any(word in desc_lower for word in ["multiple", "several", "many", "steps"])
    
    nodes = []
    edges = []
    x_pos = 100
    y_spacing = 200
    
    # Start node
    start = _make_node("start", x=x_pos, y=100, name="Start")
    nodes.append(start)
    last_node = start
    x_pos += y_spacing
    
    # Add process nodes based on description
    if has_multiple_steps:
        for i in range(2):
            process = _make_node("process", x=x_pos, y=100, name=f"Process Step {i+1}")
            nodes.append(process)
            edges.append(EdgeModel(id=str(uuid.uuid4()), source=last_node.id, target=process.id))
            last_node = process
            x_pos += y_spacing
    else:
        process = _make_node("process", x=x_pos, y=100, name="Main Process")
        nodes.append(process)
        edges.append(EdgeModel(id=str(uuid.uuid4()), source=last_node.id, target=process.id))
        last_node = process
        x_pos += y_spacing
    
    # Add decision node if needed
    if has_decision:
        decision = _make_node("decision", x=x_pos, y=100, name="Decision Point")
        nodes.append(decision)
        edges.append(EdgeModel(id=str(uuid.uuid4()), source=last_node.id, target=decision.id))
        x_pos += y_spacing
        
        # Create two paths from decision
        end_yes = _make_node("end", x=x_pos, y=50, name="End (Yes)")
        end_no = _make_node("end", x=x_pos, y=150, name="End (No)")
        nodes.extend([end_yes, end_no])
        edges.append(EdgeModel(id=str(uuid.uuid4()), source=decision.id, target=end_yes.id))
        edges.append(EdgeModel(id=str(uuid.uuid4()), source=decision.id, target=end_no.id))
    else:
        # Simple end
        end = _make_node("end", x=x_pos, y=100, name="End")
        nodes.append(end)
        edges.append(EdgeModel(id=str(uuid.uuid4()), source=last_node.id, target=end.id))
    
    return WorkflowModel(nodes=nodes, edges=edges)

# --- Routes ---
@app.post("/generate_workflow", response_model=WorkflowModel)
async def generate_workflow(request: WorkflowRequest):
    """Generate a workflow from natural language description using AI or fallback logic"""
    try:
        if USE_AI and workflow_agent is not None:
            try:
                # Use PydanticAI agent to generate workflow
                result = await workflow_agent.run(request.description)
                
                # The result should already be a WorkflowModel
                if isinstance(result.data, WorkflowModel):
                    return result.data
                elif isinstance(result.data, dict):
                    # Try to parse as WorkflowModel
                    return WorkflowModel(**result.data)
                else:
                    # Fallback if AI returns unexpected format
                    raise ValueError("AI returned unexpected format")
                    
            except Exception as ai_error:
                print(f"AI generation failed: {ai_error}, falling back to mock")
                # Fall through to mock on any AI error
        
        # Fallback to mock workflow
        workflow = generate_mock_workflow(request.description)
        return workflow
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate workflow: {str(e)}")

@app.get("/")
async def root():
    """Health check and API info"""
    return {
        "message": "Workflow Builder API is running",
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "ai_enabled": USE_AI,
        "ai_model": AI_MODEL if USE_AI else None,
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "ai_available": USE_AI}

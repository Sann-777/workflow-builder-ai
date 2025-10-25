"""
AWS Lambda handler for Workflow Builder API
Wraps FastAPI app with Mangum so it can run behind API Gateway (HTTP API)
"""
import json
from mangum import Mangum
from app.main import app

# Disable lifespan to avoid startup/shutdown events issues on Lambda
_handler = Mangum(app, lifespan="off")

def handler(event, context):
    """Wrapper to log events for debugging"""
    print(f"Event: {json.dumps(event)}")
    result = _handler(event, context)
    print(f"Result: {json.dumps(result)}")
    return result

#!/bin/bash

echo "🚀 Starting Workflow Builder in development mode..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend
echo -e "${BLUE}Starting backend on http://localhost:8000${NC}"
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Created backend/.env from .env.example${NC}"
fi

pip install -r requirements.txt > /dev/null 2>&1
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend on http://localhost:3000${NC}"
cd ../frontend

if [ ! -f .env ]; then
    cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Workflow Builder
VITE_APP_VERSION=1.0.0
VITE_ENABLE_AI_GENERATION=true
EOF
    echo -e "${GREEN}Created frontend/.env${NC}"
fi

npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Development servers running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "API Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo -e "\nPress Ctrl+C to stop all services"
echo -e "${GREEN}========================================${NC}"

# Wait for processes
wait

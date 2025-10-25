#!/bin/bash

echo "🔍 Verifying Workflow Builder Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    echo -e "${GREEN}✓ $VERSION${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    VERSION=$(npm --version)
    echo -e "${GREEN}✓ v$VERSION${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Python
echo -n "Checking Python... "
if command -v python3 &> /dev/null; then
    VERSION=$(python3 --version)
    echo -e "${GREEN}✓ $VERSION${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check AWS CLI
echo -n "Checking AWS CLI... "
if command -v aws &> /dev/null; then
    VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
    echo -e "${GREEN}✓ $VERSION${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Terraform
echo -n "Checking Terraform... "
if command -v terraform &> /dev/null; then
    VERSION=$(terraform version | head -n1)
    echo -e "${GREEN}✓ $VERSION${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📁 Checking project structure..."

# Check backend files
echo -n "Backend files... "
if [ -f "backend/app/main.py" ] && [ -f "backend/lambda_handler.py" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check frontend files
echo -n "Frontend files... "
if [ -f "frontend/src/App.jsx" ] && [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check infrastructure files
echo -n "Infrastructure files... "
if [ -f "infrastructure/main.tf" ] && [ -f "infrastructure/providers.tf" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check GitHub Actions
echo -n "GitHub Actions... "
if [ -f ".github/workflows/deploy-infrastructure.yml" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📝 Checking configuration files..."

# Check .env.example files
echo -n "Backend .env.example... "
if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Missing (optional)${NC}"
fi

echo -n "Frontend .env.example... "
if [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Missing (optional)${NC}"
fi

echo ""
echo "🔧 Checking scripts..."

# Check scripts are executable
for script in "scripts/deploy-all.sh" "scripts/local-dev.sh" "backend/deploy-lambda.sh"; do
    echo -n "$(basename $script)... "
    if [ -x "$script" ]; then
        echo -e "${GREEN}✓ Executable${NC}"
    elif [ -f "$script" ]; then
        echo -e "${YELLOW}⚠ Not executable (run: chmod +x $script)${NC}"
    else
        echo -e "${RED}✗ Missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "📚 Checking documentation..."

for doc in "README.md" "DEPLOYMENT.md" "CONTRIBUTING.md" "PROJECT_SUMMARY.md"; do
    echo -n "$doc... "
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "You're ready to:"
    echo "  1. Run locally: ${BLUE}./scripts/local-dev.sh${NC}"
    echo "  2. Deploy to AWS: ${BLUE}./scripts/deploy-all.sh${NC}"
else
    echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
fi
echo "=========================================="

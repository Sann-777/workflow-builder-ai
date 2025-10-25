# Contributing to Workflow Builder

Thank you for your interest in contributing to Workflow Builder! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear use case
   - Proposed solution
   - Alternative solutions considered
   - Impact on existing features

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the coding standards
4. Test your changes locally
5. Commit with clear messages:
   ```bash
   git commit -m "feat: add workflow template feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request with:
   - Clear description of changes
   - Link to related issues
   - Screenshots/videos if UI changes

## Development Setup

See README.md for detailed setup instructions.

Quick start:
```bash
./scripts/local-dev.sh
```

## Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Keep functions focused and small
- Use meaningful variable names

Example:
```python
def generate_workflow(description: str) -> WorkflowModel:
    """
    Generate a workflow from natural language description.
    
    Args:
        description: Natural language workflow description
        
    Returns:
        WorkflowModel with nodes and edges
    """
    # Implementation
```

### JavaScript/React (Frontend)

- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Keep components small and focused
- Use PropTypes or TypeScript for type safety

Example:
```javascript
const CustomNode = ({ id, data }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Component logic
  
  return (
    // JSX
  )
}
```

### Terraform (Infrastructure)

- Use descriptive resource names
- Add comments for complex configurations
- Use variables for configurable values
- Tag all resources appropriately

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Start both servers
./scripts/local-dev.sh

# In another terminal, run integration tests
npm run test:integration
```

## Commit Message Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add workflow template library
fix: resolve CORS issue in production
docs: update deployment guide
refactor: simplify node validation logic
```

## Project Structure

- `backend/` - FastAPI backend with PydanticAI
- `frontend/` - React frontend with React Flow
- `infrastructure/` - Terraform AWS infrastructure
- `.github/workflows/` - CI/CD pipelines
- `scripts/` - Deployment and utility scripts

## Review Process

1. All PRs require at least one review
2. CI checks must pass
3. Code must follow style guidelines
4. Tests must be included for new features
5. Documentation must be updated

## Release Process

1. Update version in `package.json` and `backend/app/main.py`
2. Update CHANGELOG.md
3. Create a release tag
4. Deploy to production

## Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review the README.md and documentation

Thank you for contributing! 🎉

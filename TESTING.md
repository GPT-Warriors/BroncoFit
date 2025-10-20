# CI/CD Testing Guide

This document explains how to run tests for BroncoFit's backend and frontend.

## Backend Tests (Python/Pytest)

### Running Tests Locally

1. Navigate to the API directory:
```bash
cd api
```

2. Install test dependencies:
```bash
pip install -r requirements.txt
```

3. Run all tests:
```bash
pytest tests/ -v
```

4. Run specific test files:
```bash
pytest tests/test_auth.py -v
pytest tests/test_calculations.py -v
pytest tests/test_models.py -v
```

5. Run tests with coverage:
```bash
pytest tests/ --cov=app --cov-report=html
```

### Test Structure

- `tests/conftest.py` - Pytest configuration and fixtures
- `tests/test_auth.py` - Authentication and JWT tests (14 tests)
- `tests/test_calculations.py` - BMR/TDEE calculation tests (10 tests)
- `tests/test_models.py` - Pydantic model validation tests (14 tests)

### Environment Variables for Testing

Create a `.env.test` file in the `api/` directory:
```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=broncofit_test
JWT_SECRET_KEY=test-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Frontend Tests (JavaScript/Vitest)

### Running Tests Locally

1. Install dependencies (from project root):
```bash
npm install
```

2. Run all tests:
```bash
npm test
```

3. Run tests in watch mode (auto-rerun on changes):
```bash
npm run test:watch
```

4. Run tests with coverage:
```bash
npm run test:coverage
```

### Test Structure

- `src/test/setup.js` - Vitest configuration and global mocks
- `src/services/__tests__/api.test.js` - API service tests (9 tests)
- `src/components/__tests__/ProfilePage.test.jsx` - ProfilePage component tests (4 tests)
- `src/components/__tests__/LoginPage.test.jsx` - LoginPage component tests (4 tests)

## GitHub Actions CI/CD

The project uses GitHub Actions for automated testing and optional deployment.

### Workflow Triggers

- **Push to `main` or `develop`**: Runs tests and builds
- **Pull requests to `main`**: Runs tests only

### Current Pipeline (Without Deployment)

The CI/CD pipeline currently performs:

1. **Test Job**:
   - Sets up Python 3.11 and Node.js 18.x
   - Installs backend dependencies
   - Runs pytest for backend tests
   - Installs frontend dependencies
   - Runs Vitest for frontend tests
   - Builds production frontend
   - Uploads test results and build artifacts

### Adding EC2 Deployment (Optional)

When ready to deploy to EC2, you can enable the deployment job by:

1. **Uncommenting the deploy job** in `.github/workflows/ci-cd.yml`
2. **Adding GitHub Secrets** (see below)
3. **Setting up EC2 instance** with systemd services

#### Required GitHub Secrets for Deployment

Configure these in your repository settings (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `EC2_HOST` | EC2 instance IP or hostname | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` or `ec2-user` |
| `EC2_SSH_KEY` | Private SSH key (PEM format) | Contents of your `.pem` file |
| `REMOTE_DIR` | Deployment directory on EC2 | `/home/ubuntu/broncofit` |
| `EC2_SSH_PORT` | SSH port (optional) | `22` (default) |

#### Deployment Job Steps (When Enabled)

The deployment job will:
- Build frontend
- Sync backend files to EC2 (excludes venv, tests, .env)
- Sync frontend build to EC2
- Install dependencies on EC2
- Restart backend service and nginx

### Viewing Test Results

- Go to your GitHub repository
- Click "Actions" tab
- Select a workflow run to see detailed logs
- Test results are uploaded as artifacts

## Local Development Testing

### Quick Test Commands

```bash
# Backend only
cd api && pytest tests/ -v

# Frontend only
npm test

# Both (run separately)
cd api
pytest tests/ -v
cd ..
npm test
```

### Pre-commit Testing

Before pushing code, run:

```bash
# Run all tests
cd api && pytest tests/ && cd .. && npm test

# Run linting
npm run lint
```

## Writing New Tests

### Backend (Pytest)

Create test files in `api/tests/` with the pattern `test_*.py`:

```python
import pytest
from app.calculations import calculate_bmr

def test_bmr_calculation():
    result = calculate_bmr(weight_kg=80, height_cm=180, age=25, sex="male")
    assert result > 0
```

### Frontend (Vitest)

Create test files in `src/components/__tests__/` or `src/services/__tests__/`:

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Backend Tests Failing

- Ensure MongoDB is not required (tests use mocks)
- Check environment variables in `conftest.py`
- Verify Python version (3.11+)

### Frontend Tests Failing

- Clear node_modules: `rm -rf node_modules && npm install`
- Check Vitest config in `vitest.config.js`
- Verify Node version (18.x+)

### CI/CD Workflow Failing

- Check the Actions tab for detailed logs
- Ensure all tests pass locally first
- For deployment issues: verify EC2 configuration and secrets

## Test Results Summary

✅ **Backend (Pytest)**: 38 tests passing
- Authentication: 14 tests
- Calculations: 10 tests  
- Models: 14 tests

✅ **Frontend (Vitest)**: 17 tests passing
- API Service: 9 tests
- LoginPage: 4 tests
- ProfilePage: 4 tests

**Total: 55 tests passing** 🎉

## Best Practices

1. **Write tests for new features** before merging to `main`
2. **Run tests locally** before pushing
3. **Keep tests fast** - mock external services (database, APIs)
4. **Use descriptive test names** that explain what's being tested
5. **Maintain high test coverage** (aim for 80%+)
6. **Mock database operations** - don't require actual MongoDB for unit tests
7. **Test edge cases** - invalid inputs, boundary conditions, error scenarios

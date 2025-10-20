# Quick Start: Testing & CI/CD Setup

## ✅ Status: All Tests Passing! 🎉

Frontend: **17 tests passed** ✓  
Backend: **38 tests passed** ✓

## 🚀 Installation

### Backend Testing Setup
```bash
cd api
pip install -r requirements.txt
```

### Frontend Testing Setup
```bash
npm install
```

## ✅ Run Tests Locally

### Backend (Pytest)
```bash
# Windows
cd api
pytest tests/ -v

# Unix/Mac
cd api && pytest tests/ -v
```

### Frontend (Vitest)
```bash
npm test
```

### Run tests in watch mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## 🔧 GitHub Actions Setup

### Current CI/CD Pipeline

The workflow is currently configured to:
1. ✅ **Run Backend Tests** (pytest) on every push/PR
2. ✅ **Run Frontend Tests** (Vitest) on every push/PR
3. ✅ **Build Frontend** for production
4. ✅ **Upload Artifacts** (test results and build files)

### Step 1: Commit and Push

```bash
git add .
git commit -m "Add CI/CD pipeline with comprehensive tests"
git push origin main
```

### Step 2: Monitor Workflow

- Go to GitHub → Actions tab
- Watch your workflow run
- Tests run automatically on every push/PR
- Build artifacts are saved for later deployment

## 🚀 Adding EC2 Deployment (Optional - Add Later)

When you're ready to deploy to EC2, the workflow includes commented-out deployment steps.

### Prerequisites for EC2 Deployment:

1. **EC2 Instance Setup**
   - Ubuntu/Amazon Linux server running
   - SSH access configured
   - Systemd services set up (see below)

2. **Add GitHub Secrets**
   
   Go to: Repository → Settings → Secrets and variables → Actions → New repository secret
   
   Add these secrets:
   - **EC2_HOST**: Your EC2 IP address (e.g., `54.123.45.67`)
   - **EC2_USER**: SSH username (e.g., `ubuntu` or `ec2-user`)
   - **EC2_SSH_KEY**: Your private SSH key (entire contents of `.pem` file)
   - **REMOTE_DIR**: Deployment path (e.g., `/home/ubuntu/broncofit`)
   - **EC2_SSH_PORT** (optional): SSH port, defaults to `22`

3. **Uncomment Deployment Job**
   
   In `.github/workflows/ci-cd.yml`, uncomment the `deploy` job section (lines are marked with `#`)

### EC2 Systemd Service Configuration

Create this file on your EC2 instance:

**`/etc/systemd/system/broncofit-api.service`**
```ini
[Unit]
Description=BroncoFit FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/broncofit/api
Environment="PATH=/home/ubuntu/broncofit/api/venv/bin"
ExecStart=/home/ubuntu/broncofit/api/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable broncofit-api
sudo systemctl start broncofit-api
```

## 📊 Test Coverage

### Backend Tests (Pytest) - 38 tests
- ✅ Authentication (login, register, JWT tokens) - 14 tests
- ✅ Password hashing and verification - 2 tests
- ✅ BMR/TDEE calculations - 10 tests
- ✅ Model validation (Pydantic) - 12 tests

### Frontend Tests (Vitest) - 17 tests
- ✅ API service methods - 9 tests
- ✅ LoginPage component - 4 tests
- ✅ ProfilePage component - 4 tests
- ✅ Error handling
- ✅ User interactions

## 🎯 Current Workflow Behavior

**On Push/PR to main or develop:**
1. ✅ Backend tests run (pytest)
2. ✅ Frontend tests run (Vitest)
3. ✅ Frontend builds for production
4. ✅ Artifacts are uploaded
5. ⏸️ Deployment is **disabled** (until you configure EC2)

**When you enable deployment:**
- Only triggers on push to `main` branch (not on PRs)
- Automatically syncs code to EC2
- Installs dependencies
- Restarts services

## 🔍 Troubleshooting

### Tests fail locally
- Backend: Check Python version (3.11+), install dependencies
- Frontend: Check Node version (18.x+), run `npm ci`

### GitHub Actions fails
- Check the Actions tab for detailed error logs
- Ensure all tests pass locally first

### Adding EC2 Deployment Later
- Uncomment the `deploy` job in `.github/workflows/ci-cd.yml`
- Add required GitHub secrets
- Set up EC2 instance with systemd services
- Push to `main` to trigger deployment

## 📚 More Information

See `TESTING.md` for detailed documentation on:
- Writing new tests
- Test structure
- Coverage reports
- Best practices

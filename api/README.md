# BroncoFit API

FastAPI backend powering authentication, measurements, workouts, nutrition logging, and the AI coach that feeds the BroncoFit frontend.

## Features
- JWT authentication and password hashing with bcrypt
- MongoDB persistence with Motor
- Profile, measurement, workout, and nutrition routers
- AI endpoints that proxy Google Gemini for chat and workout suggestions
- Automatic OpenAPI docs at `/docs` and `/redoc`

## Requirements
- Python 3.11+
- MongoDB instance (local or Atlas)
- Google Gemini API key

## Installation
1. `cd api`
2. Create/activate a virtual environment
   - Windows: `python -m venv venv && .\venv\Scripts\activate`
   - macOS/Linux: `python3 -m venv venv && source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Create `.env` in `api/` with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/broncofit
   DATABASE_NAME=broncofit
   JWT_SECRET_KEY=replace-with-strong-secret
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY=replace-with-google-gemini-key
   ```
5. (Optional) copy `.env` template above into `.env.production` for deployment

## Running the Server
### Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The API is available at `http://localhost:8000` and documentation at `/docs`.

### Production
Use multiple workers and a process manager (systemd, supervisor, Docker, etc.):
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Example systemd unit (`/etc/systemd/system/broncofit-api.service`):
```ini
[Unit]
Description=BroncoFit FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/BroncoFit/api
Environment="PATH=/home/ubuntu/BroncoFit/api/venv/bin"
ExecStart=/home/ubuntu/BroncoFit/api/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Testing
```bash
# from repo root
cd api
pytest tests -v
```
Use `pytest --cov=app --cov-report=html` for coverage.

## Key Routers
- `auth.py` â€“ register/login/me
- `profile.py` â€“ CRUD operations for user fitness data
- `measurements.py` â€“ weight/body-fat tracking
- `workouts.py` â€“ logging and querying workouts
- `nutrition.py` â€“ meal logging
- `ai_coach.py` â€“ chat, workout plan, and workout suggestions via Gemini
- `calculations.py` â€“ BMI/BMR/TDEE helpers

## Troubleshooting
- **Mongo connection errors:** verify `MONGODB_URI` and network access
- **JWT errors:** regenerate `JWT_SECRET_KEY` and ensure clocks are in sync
- **Gemini failures:** confirm API key and quota; logs will show errors via the Python logger
- **CORS issues:** update the `allow_origins` list in `app/main.py`

## License
Apache License (see root `LICENSE`).

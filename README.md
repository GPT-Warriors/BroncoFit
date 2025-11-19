[![CI/CD Pipeline](https://github.com/GPT-Warriors/BroncoFit/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/GPT-Warriors/BroncoFit/actions/workflows/ci-cd.yml)
![GitHub License](https://img.shields.io/github/license/GPT-Warriors/BroncoFit)
[![codecov](https://codecov.io/gh/GPT-Warriors/BroncoFit/branch/main/graph/badge.svg?token=EQR0FSM927)](https://codecov.io/gh/GPT-Warriors/BroncoFit)
 # BroncoFit

BroncoFit is an end-to-end fitness companion that pairs a modern Vite + React frontend with a FastAPI backend to deliver AI-assisted coaching, nutrition logging, and performance analytics.

## Why BroncoFit
- Secure authentication backed by JWTs
- Progress dashboards with charts, PR tracking, and nutrition analytics
- AI-powered coach for chat guidance and structured workout suggestions
- Workout and meal logging tied to MongoDB for persistence
- Responsive, mobile-friendly UI built with React 19 and Recharts

## Tech Stack
- **Frontend:** React 19, Vite, Recharts, Vitest, Testing Library
- **Backend:** FastAPI, Motor (MongoDB), Pydantic, jose, bcrypt, Google Gemini API
- **Tooling:** ESLint, pytest, GitHub Actions CI

## Prerequisites
- Node.js 18+
- npm 9+
- Python 3.11+
- MongoDB 6/7 (local or Atlas)
- Google Gemini API key (for AI coach features)

## Backend Setup (FastAPI)
1. `cd api`
2. Create and activate a virtual environment
   - Windows: `python -m venv venv && .\venv\Scripts\activate`
   - macOS/Linux: `python3 -m venv venv && source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Create `api/.env` with the following keys:
   ```env
   MONGODB_URI=mongodb://localhost:27017/broncofit
   DATABASE_NAME=broncofit
   JWT_SECRET_KEY=replace-with-strong-secret
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY=replace-with-google-gemini-key
   ```
5. Start the API: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
6. Docs are available at `http://localhost:8000/docs`

## Frontend Setup (React + Vite)
1. From the repo root run `npm install`
2. Start the dev server: `npm run dev`
3. Vite serves the app at `http://localhost:5173`

## Local Development Flow
1. Run the FastAPI server (step above)
2. Run the Vite dev server
3. Update `src/services/api.js` if your API base URL differs from `/api`

## Testing & Quality
| Area      | Command                              |
|-----------|---------------------------------------|
| Frontend  | `npm test` (single run)
|           | `npm run test:watch`
|           | `npm run test:coverage`
| Lint      | `npm run lint`
| Backend   | `cd api && pytest tests -v`

## Production Build & Deployment
- Build frontend assets: `npm run build` (outputs to `dist/`, ignored by git)
- Serve the compiled frontend behind nginx or any static file host
- Run the API with multiple workers:
  `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`
- Example systemd service is documented in `api/README.md`

## API Overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/PUT /api/profile`, `POST /api/profile/initialize`
- `GET/POST /api/measurements`, `GET /api/measurements/latest`
- `POST /api/calculations/tdee|bmi`
- `GET/POST /api/workouts`, `GET /api/workouts/latest`
- `GET/POST /api/nutrition`
- `POST /api/ai-coach/chat` and `/ai-coach/suggest-workout`

## Troubleshooting
- **Frontend build errors:** remove `node_modules`, reinstall, and rerun `npm run dev`
- **Backend connection issues:** verify MongoDB is reachable and credentials are correct
- **CORS errors:** update the allowed origins list in `api/app/main.py`
- **AI coach failures:** ensure `GEMINI_API_KEY` is set and has quota

## License
BroncoFit is released under the Apache License. See `LICENSE` for details.

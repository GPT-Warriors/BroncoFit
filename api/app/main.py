from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, profile, calculations, measurements, ai_coach, workouts, nutrition
from app.config import settings

app = FastAPI(
    title="BroncoFit API",
    description="AI Fitness Coach Backend API",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Local development
        "http://localhost:5173",      # Vite default port
        "https://bronco.fit",         # Production
        "https://www.bronco.fit",     # Production www
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()


# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(calculations.router, prefix="/api")
app.include_router(measurements.router, prefix="/api")
app.include_router(ai_coach.router, prefix="/api")
app.include_router(workouts.router, prefix="/api")
app.include_router(nutrition.router, prefix="/api")


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "BroncoFit API"}


@app.get("/")
async def root():
    return {
        "message": "BroncoFit API",
        "version": "1.0.0",
        "docs": "/docs"
    }

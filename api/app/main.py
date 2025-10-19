from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, profile, calculations, measurements
from app.config import settings

app = FastAPI(
    title="BroncoFit API",
    description="AI Fitness Coach Backend API",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
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


# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(calculations.router)
app.include_router(measurements.router)


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


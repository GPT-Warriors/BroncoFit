from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def get_database():
    # Ensure client is initialized
    if db.client is None:
        await connect_to_mongo()
    return db.client[settings.database_name]


async def connect_to_mongo():
    """Connect to MongoDB on startup"""
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.mongodb_uri)
        print(f"Connected to MongoDB at {settings.mongodb_uri}")


async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    if db.client is not None:
        db.client.close()
        print("Closed MongoDB connection")

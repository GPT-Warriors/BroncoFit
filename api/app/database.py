import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger(__name__)


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
        logger.info("Connected to MongoDB at %s", settings.mongodb_uri)


async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    if db.client is not None:
        db.client.close()
        logger.info("Closed MongoDB connection")

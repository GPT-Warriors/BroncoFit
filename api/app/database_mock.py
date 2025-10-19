"""
Mock Database for Testing Without MongoDB
This allows testing the API without requiring a MongoDB instance
"""
from datetime import datetime
from typing import Dict, List, Optional
import copy

class MockCollection:
    """Mock MongoDB collection"""
    def __init__(self, name: str):
        self.name = name
        self.documents: Dict[str, dict] = {}
        self._counter = 0

    async def find_one(self, query: dict) -> Optional[dict]:
        """Find a single document"""
        for doc_id, doc in self.documents.items():
            if self._matches_query(doc, query):
                return copy.deepcopy(doc)
        return None

    async def find(self, query: dict = None, limit: int = 0, skip: int = 0) -> List[dict]:
        """Find multiple documents"""
        results = []
        for doc_id, doc in self.documents.items():
            if query is None or self._matches_query(doc, query):
                results.append(copy.deepcopy(doc))

        if skip:
            results = results[skip:]
        if limit:
            results = results[:limit]
        return results

    async def insert_one(self, document: dict):
        """Insert a single document"""
        self._counter += 1
        doc_id = f"mock_id_{self._counter}"
        doc_with_id = copy.deepcopy(document)
        doc_with_id["_id"] = doc_id
        self.documents[doc_id] = doc_with_id

        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id

        return InsertResult(doc_id)

    async def update_one(self, query: dict, update: dict):
        """Update a single document"""
        for doc_id, doc in self.documents.items():
            if self._matches_query(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                break

        class UpdateResult:
            def __init__(self):
                self.modified_count = 1

        return UpdateResult()

    async def delete_one(self, query: dict):
        """Delete a single document"""
        for doc_id, doc in list(self.documents.items()):
            if self._matches_query(doc, query):
                del self.documents[doc_id]
                break

        class DeleteResult:
            def __init__(self):
                self.deleted_count = 1

        return DeleteResult()

    def _matches_query(self, doc: dict, query: dict) -> bool:
        """Check if document matches query"""
        for key, value in query.items():
            if key not in doc or doc[key] != value:
                return False
        return True

class MockDatabase:
    """Mock MongoDB database"""
    def __init__(self):
        self.collections: Dict[str, MockCollection] = {}

    def __getattr__(self, name: str) -> MockCollection:
        """Get or create a collection"""
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

class MockClient:
    """Mock MongoDB client"""
    def __init__(self):
        self.databases: Dict[str, MockDatabase] = {}

    def __getitem__(self, name: str) -> MockDatabase:
        """Get or create a database"""
        if name not in self.databases:
            self.databases[name] = MockDatabase()
        return self.databases[name]

    def close(self):
        """Mock close"""
        pass

# Singleton mock client
_mock_client = MockClient()

class MockDatabaseWrapper:
    """Wrapper to use mock database"""
    client = _mock_client

db = MockDatabaseWrapper()

async def get_database():
    """Get mock database"""
    return db.client["broncofit"]

async def connect_to_mongo():
    """Mock connection"""
    print("⚠️  Using MOCK database (no MongoDB required)")
    print("   To use real MongoDB, ensure MONGODB_URI is set in .env")

async def close_mongo_connection():
    """Mock close"""
    print("Mock database closed")


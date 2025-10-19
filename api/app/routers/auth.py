from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.models import UserCreate, UserLogin, UserOut, Token
from app.auth import get_password_hash, verify_password, create_access_token
from app.database import get_database
from app.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""
    db = await get_database()

    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user_dict = {
        "email": user.email,
        "name": user.name,
        "password_hash": get_password_hash(user.password),
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user_dict)

    return UserOut(
        id=str(result.inserted_id),
        email=user.email,
        name=user.name,
        created_at=user_dict["created_at"]
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    db = await get_database()

    # Find user by email (username field contains email)
    user = await db.users.find_one({"email": form_data.username})

    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information"""
    return UserOut(
        id=str(current_user["_id"]),
        email=current_user["email"],
        name=current_user.get("name"),
        created_at=current_user["created_at"]
    )

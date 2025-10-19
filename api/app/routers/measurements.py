from fastapi import APIRouter, HTTPException, status, Depends
from app.models import MeasurementCreate, MeasurementOut
from app.dependencies import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/api/measurements", tags=["Measurements"])


@router.post("", response_model=MeasurementOut, status_code=status.HTTP_201_CREATED)
async def create_measurement(measurement: MeasurementCreate, current_user = Depends(get_current_user)):
    """Log a new weight/body measurement"""
    db = await get_database()

    measurement_dict = measurement.model_dump(exclude_none=True)
    measurement_dict["user_id"] = str(current_user["_id"])
    measurement_dict["created_at"] = datetime.utcnow()

    # Use provided date or default to now
    if "measurement_date" not in measurement_dict or measurement_dict["measurement_date"] is None:
        measurement_dict["measurement_date"] = datetime.utcnow()

    result = await db.measurements.insert_one(measurement_dict)
    measurement_dict["id"] = str(result.inserted_id)

    return MeasurementOut(**measurement_dict)


@router.get("", response_model=List[MeasurementOut])
async def get_measurements(
    limit: int = 100,
    skip: int = 0,
    current_user = Depends(get_current_user)
):
    """Get measurement history for the current user"""
    db = await get_database()

    cursor = db.measurements.find(
        {"user_id": str(current_user["_id"])}
    ).sort("measurement_date", -1).skip(skip).limit(limit)

    measurements = await cursor.to_list(length=limit)

    return [
        MeasurementOut(
            id=str(m["_id"]),
            user_id=m["user_id"],
            weight_kg=m["weight_kg"],
            body_fat_pct=m.get("body_fat_pct"),
            notes=m.get("notes"),
            measurement_date=m.get("measurement_date"),
            created_at=m["created_at"]
        )
        for m in measurements
    ]


@router.get("/latest", response_model=MeasurementOut)
async def get_latest_measurement(current_user = Depends(get_current_user)):
    """Get the most recent measurement"""
    db = await get_database()

    measurement = await db.measurements.find_one(
        {"user_id": str(current_user["_id"])},
        sort=[("measurement_date", -1)]
    )

    if not measurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No measurements found"
        )

    return MeasurementOut(
        id=str(measurement["_id"]),
        user_id=measurement["user_id"],
        weight_kg=measurement["weight_kg"],
        body_fat_pct=measurement.get("body_fat_pct"),
        notes=measurement.get("notes"),
        measurement_date=measurement.get("measurement_date"),
        created_at=measurement["created_at"]
    )


@router.delete("/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_measurement(measurement_id: str, current_user = Depends(get_current_user)):
    """Delete a measurement"""
    db = await get_database()

    try:
        obj_id = ObjectId(measurement_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid measurement ID"
        )

    result = await db.measurements.delete_one({
        "_id": obj_id,
        "user_id": str(current_user["_id"])
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found"
        )

    return None


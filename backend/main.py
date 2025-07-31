from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import redis
import json

app = FastAPI()

# Connect to Redis. Use host name `redis` when running in docker-compose.
r = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)


class HourEntry(BaseModel):
    """Represents a single hour entry for a given day."""
    hour: int
    mood: Optional[int] = None
    notes: Optional[str] = None


class DayHourUpdate(BaseModel):
    """Model for updating a single hour on a specific date."""
    date: str  # YYYY-MM-DD
    hour: int
    mood: Optional[int] = None
    notes: Optional[str] = None


@app.get("/api/day", response_model=List[HourEntry])
def get_day_view(date: str):
    """
    Return a list of 24 HourEntry objects for the given date.
    If an hour has no stored data, mood and notes will be None.
    """
    try:
        # Validate date format
        date_obj = date.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    key = f"day:{date}"
    entries = r.hgetall(key)
    result: List[HourEntry] = []
    for hour in range(24):
        h_key = f"{hour:02d}"
        if h_key in entries:
            try:
                data = json.loads(entries[h_key])
                result.append(HourEntry(hour=hour, **data))
            except json.JSONDecodeError:
                result.append(HourEntry(hour=hour))
        else:
            result.append(HourEntry(hour=hour))
    return result


@app.post("/api/day")
def update_hour(entry: DayHourUpdate):
    """
    Update (or create) a single hour entry for a given date. Stores the mood and notes
    in a Redis hash keyed by the date, with each field set to a JSON blob.
    """
    try:
        # Validate date string
        date_obj = date.fromisoformat(entry.date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    if not (0 <= entry.hour <= 23):
        raise HTTPException(status_code=400, detail="hour must be between 0 and 23")
    # Prepare Redis key and field
    key = f"day:{entry.date}"
    field = f"{entry.hour:02d}"
    value = json.dumps({"mood": entry.mood, "notes": entry.notes})
    try:
        r.hset(key, field, value)
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import redis
import json

app = FastAPI()

# Connect to Redis. Use host name `redis` when running in docker-compose.
r = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)

# Load food data into memory on startup
try:
    with open("foundation_foods.json", "r") as f:
        food_data = json.load(f)["FoundationFoods"]
except FileNotFoundError:
    food_data = []

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

class Recipe(BaseModel):
    """Model for saving a recipe."""
    name: str
    food_fdc_ids: List[int]

# --- New Endpoints for Food/Recipe Functionality ---

@app.get("/api/foods")
def get_all_foods():
    """Returns a list of all food descriptions for autocomplete."""
    if not food_data:
        raise HTTPException(status_code=404, detail="Food data not found.")
    return [{"fdcId": food["fdcId"], "description": food["description"]} for food in food_data]

@app.post("/api/recipe")
def save_recipe(recipe: Recipe):
    """Saves a new recipe to Redis."""
    key = f"recipe:{recipe.name.lower()}"
    if r.exists(key):
        raise HTTPException(status_code=400, detail="A recipe with this name already exists.")
    
    # Store the list of food FDC IDs as a JSON string
    r.set(key, json.dumps(recipe.food_fdc_ids))
    return {"message": f"Recipe '{recipe.name}' saved successfully."}

@app.get("/api/recipe/{name}")
def get_recipe(name: str):
    """Retrieves a saved recipe and its full food data by name."""
    key = f"recipe:{name.lower()}"
    food_ids_json = r.get(key)
    
    if not food_ids_json:
        raise HTTPException(status_code=404, detail="Recipe not found.")
        
    food_ids = json.loads(food_ids_json)
    
    # Find the full food objects from the in-memory list
    recipe_foods = [food for food in food_data if food["fdcId"] in food_ids]
    
    return {"name": name, "foods": recipe_foods}


# --- Existing Calendar Endpoints ---

@app.get("/api/day", response_model=List[HourEntry])
def get_day_view(date_str: str = Query(..., alias="date")):
    """
    Return a list of 24 HourEntry objects for the given date.
    If an hour has no stored data, mood and notes will be None.
    """
    try:
        # Validate date format
        date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    key = f"day:{date_str}"
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
        date.fromisoformat(entry.date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    if not (0 <= entry.hour <= 23):
        raise HTTPException(status_code=400, detail="hour must be between 0 and 23")
    # Prepare Redis key and field
    key = f"day:{entry.date}"
    field = f"{entry.hour:02d}"
    value = json.dumps({"mood": entry.mood, "notes": entry.notes})
    r.hset(key, field, value)
    return {"status": "success", "date": entry.date, "hour": entry.hour}

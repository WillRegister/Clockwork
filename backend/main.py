from fastapi import FastAPI
import redis

app = FastAPI()

# Say Hello from root

@app.get ("/")
def read_root():
    try:
        return {"hello"}
    except Exception as e:
        return {"error": str(e)}

# Connect to Redis (host must match your docker-compose service name)
r = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)

@app.get("/ping-redis")
def ping_redis():
    try:
        r.set("hello", "world")
        value = r.get("hello")
        return {"redis says": value}
    except Exception as e:
        return {"error": str(e)}
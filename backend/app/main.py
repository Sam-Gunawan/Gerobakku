from fastapi import FastAPI
from .database import *
app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

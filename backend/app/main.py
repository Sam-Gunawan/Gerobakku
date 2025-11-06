from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import close_database, init_db_pool
from .routers import auth_router
from .firebase import init_firebase
from .routers import live_location_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize the database pool
    init_db_pool()

    # Initialize Firebase connection
    init_firebase()
    
    yield
    
    # Shutdown: close the database pool
    close_database()

app = FastAPI(
    lifespan=lifespan,
    title="Gerobakku Backend API",
    version="0.1.0"    
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
    ],
    allow_credentials=True, # Allow cookies, authorization headers, etc.
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}

app.include_router(auth_router.router)
app.include_router(live_location_router.router)
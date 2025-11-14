from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import close_database, init_db_pool
from .routers import auth_router, vendor_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize the database pool
    init_db_pool()
    
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
app.include_router(vendor_router.router)
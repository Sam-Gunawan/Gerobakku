from fastapi import APIRouter, status
import asyncio
from app.services.vendor_service import simulate_movement

router = APIRouter(prefix="/vendor", tags=["vendor"])


@router.put("/simulateMove", status_code=status.HTTP_200_OK)
async def simulate_move():
    """Start the simulation in a background thread and return immediately.

    Uses asyncio.get_running_loop().run_in_executor to avoid blocking the event loop
    since `simulate_movement` is CPU/sleep-bound and performs blocking DB I/O.
    """
    loop = asyncio.get_running_loop()
    # Schedule simulate_movement in the default thread pool; do not await it.
    loop.run_in_executor(None, simulate_movement, 1, 5, 1)
    return {"detail": "Simulation started."}
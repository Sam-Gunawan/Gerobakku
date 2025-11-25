from fastapi import APIRouter, status, HTTPException, UploadFile, File, Depends
from typing import List, Optional
import asyncio
from app.services.vendor_service import simulate_movement
from app.repositories import vendor_repo
from app.schemas.vendor_schema import StoreLocationUpdate, VendorStoreRegistrationForm, VendorStoreRegistrationResponse

router = APIRouter(prefix="/vendor", tags=["vendor"])


@router.get("/locations", response_model=List[StoreLocationUpdate], status_code=status.HTTP_200_OK)
async def get_all_vendor_locations():
    """
    Lightweight endpoint that returns only store IDs and current locations.
    Used for efficient polling without fetching full store data.
    """
    try:
        locations = vendor_repo.get_all_stores_with_locations()
        return locations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch locations: {str(e)}"
        )


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


@router.post("/simulate3Vendors", status_code=status.HTTP_200_OK)
async def simulate_three_vendors_endpoint():
    """
    Start movement simulation for 3 vendors near Sampoerna University.
    These vendors will walk realistic paths in loops for demo purposes.
    Other vendors stay at their current locations.
    """
    from app.services.vendor_service import simulate_three_vendors
    
    try:
        loop = asyncio.get_running_loop()
        # Run simulation in background thread
        loop.run_in_executor(None, simulate_three_vendors)
        
        return {
            "detail": "Simulation started for 3 vendors (Sate Pak Joko, Es Teh Bu Siti, Gorengan Bu Rina)",
            "vendor_ids": [301, 302, 304],
            "info": "Each vendor will walk their path in 5 loops with 10 steps between waypoints"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start simulation: {str(e)}"
        )
        




@router.post("/registerVendorAndStore", status_code=status.HTTP_200_OK, response_model=VendorStoreRegistrationResponse)
async def register_vendor_and_store(
    form_data: VendorStoreRegistrationForm = Depends(VendorStoreRegistrationForm.as_form),
    ktp: Optional[UploadFile] = File(None),
    selfie: Optional[UploadFile] = File(None),
    store_img: Optional[UploadFile] = File(None),
):
    """Register a new vendor and store.

    Image fields (ktp, selfie, store_img) are optional and may be omitted.
    All other fields are required and validated automatically by Pydantic.
    """
    from app.services.vendor_service import register_vendor_and_store_service

    result = await register_vendor_and_store_service(
        form_data, ktp, selfie, store_img
    )
    return result
import time
import aiofiles
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.repositories.vendor_repo import post_new_vendor, post_new_vendor_store
from app.repositories.vendor_repo import insert_store_location
from app.schemas.vendor_schema import VendorRegistrationData, StoreRegistrationData, VendorStoreRegistrationResponse


# Define realistic walking paths around Sampoerna University for 3 vendors
# Sampoerna University coordinates: -6.2443, 106.8385

VENDOR_PATHS = {
    # Sate Pak Joko - walks around campus perimeter (store_id: 301)
    301: [
        {"name": "Start - Campus Gate", "lat": -6.2440, "lon": 106.8385},
        {"name": "North entrance", "lat": -6.2435, "lon": 106.8385},
        {"name": "Northeast corner", "lat": -6.2435, "lon": 106.8395},
        {"name": "East side", "lat": -6.2440, "lon": 106.8400},
        {"name": "Southeast corner", "lat": -6.2450, "lon": 106.8400},
        {"name": "South gate", "lat": -6.2450, "lon": 106.8385},
        {"name": "Southwest corner", "lat": -6.2450, "lon": 106.8375},
        {"name": "West side", "lat": -6.2440, "lon": 106.8370},
        {"name": "Back to start",  "lat": -6.2440, "lon": 106.8385},
    ],
    
    # Es Teh Bu Siti - walks street pattern (store_id: 302)
    302: [
        {"name": "Start - Main road", "lat": -6.2443, "lon": 106.8390},
        {"name": "Down street", "lat": -6.2448, "lon": 106.8392},
        {"name": "Turn right", "lat": -6.2448, "lon": 106.8388},
        {"name": "Walk back", "lat": -6.2443, "lon": 106.8386},
        {"name": "Cross street", "lat": -6.2438, "lon": 106.8384},
        {"name": "Loop around", "lat": -6.2438, "lon": 106.8390},
        {"name": "Return path", "lat": -6.2443, "lon": 106.8390},
    ],
    
    # Gorengan Bu Rina - small loop near campus (store_id: 304) 
    304: [
        {"name": "Start - Campus side", "lat": -6.2438, "lon": 106.8380},
        {"name": "Walk north", "lat": -6.2433, "lon": 106.8380},
        {"name": "Turn east", "lat": -6.2433, "lon": 106.8385},
        {"name": "Walk south", "lat": -6.2440, "lon": 106.8385},
        {"name": "Turn west", "lat": -6.2440, "lon": 106.8378},
        {"name": "Back north", "lat": -6.2438, "lon": 106.8380},
    ]
}


def interpolate_points(start, end, steps):
    """
    Interpolate between two points with the given number of steps.
    Returns a list of intermediate coordinates.
    """
    points = []
    for i in range(steps + 1):
        fraction = i / steps
        lat = start['lat'] + (end['lat'] - start['lat']) * fraction
        lon = start['lon'] + (end['lon'] - start['lon']) * fraction
        points.append({'lat': lat, 'lon': lon})
    return points


def simulate_vendor_movement(store_id, steps_per_segment=10, delay_seconds=1, loops=5):
    """
    Simulate realistic vendor movement along a predefined path.
    
    Args:
        store_id: The store/vendor ID to simulate
        steps_per_segment: Number of interpolation steps between path points
        delay_seconds: Delay between each location update (in seconds)
        loops: Number of times to repeat the full path (for continuous demo)
    """
    if store_id not in VENDOR_PATHS:
        print(f"No path defined for store {store_id}")
        return
    
    path = VENDOR_PATHS[store_id]
    total_points = 0
    
    print(f"🚶 Starting simulation for vendor {store_id} - {loops} loops")
    
    try:
        for loop_count in range(loops):
            print(f"  Loop {loop_count + 1}/{loops}")
            
            # Walk through each segment of the path
            for i in range(len(path)):
                start_point = path[i]
                # Loop back to start when reaching the end
                end_point = path[(i + 1) % len(path)]
                
                # Interpolate between points for smooth movement
                intermediate_points = interpolate_points(start_point, end_point, steps_per_segment)
                
                for point in intermediate_points:
                    # Insert location into database
                    insert_store_location(store_id, point)
                    total_points += 1
                    
                    # Small delay to simulate walking speed
                    time.sleep(delay_seconds)
            
            print(f"  ✓ Completed loop {loop_count + 1} ({total_points} points total)")
        
        print(f"✅ Simulation complete for vendor {store_id}: {total_points} total points")
        
    except Exception as e:
        print(f"❌ Error in simulation for vendor {store_id}: {e}")
        raise


def simulate_movement(store_id, steps_per_segment, delay_seconds, path=None):
    """
    Legacy function - redirect to new simulation if vendor has a path.
    This maintains backward compatibility with existing code.
    """
    if store_id in VENDOR_PATHS:
        # Use new simulation with 5 loops for demo
        simulate_vendor_movement(store_id, steps_per_segment, delay_seconds, loops=5)
    else:
        # For vendors without paths, do nothing (they stay in place)
        print(f"Vendor {store_id} has no movement path - staying at current location")
        return


def simulate_three_vendors():
    """
    Simulate movement for the 3 vendors near Sampoerna University.
    This is the main function to call for the demo.
    """
    print("=" * 60)
    print("🎬 STARTING 3-VENDOR SIMULATION")
    print("=" * 60)
    
    # Run each vendor simulation sequentially
    # Each vendor will loop their path 5 times with 10 steps between each waypoint
    # This gives approximately: 3 vendors × 5-9 waypoints × 10 steps × 5 loops = 750-1350 total points
    
    for store_id in [301, 302, 304]:
        simulate_vendor_movement(
            store_id=store_id,
            steps_per_segment=10,   # 10 smooth steps between each waypoint
            delay_seconds=2,         # 2 seconds between updates (reasonable speed)
            loops=5                  # Repeat path 5 times for ~20-30 minute demo
        )
    
    print("=" * 60)
    print("✅ ALL SIMULATIONS COMPLETE")
    print("=" * 60)




async def register_vendor_and_store_service(
    user_id: int,
    ktp: Optional[UploadFile],
    selfie: Optional[UploadFile],
    store_name: Optional[str],
    store_description: Optional[str],
    store_img: Optional[UploadFile],
    category_id: Optional[int],
    address: Optional[str],
    is_halal: Optional[bool],
    open_time: Optional[int],
    close_time: Optional[int],
) -> dict:
    """Handle vendor and store registration with file uploads."""
    
    upload_base = Path("app/uploads/vendors")
    stores_dir = upload_base / "stores"
    
    upload_base.mkdir(parents=True, exist_ok=True)
    stores_dir.mkdir(parents=True, exist_ok=True)

    def _make_local_url_for_vendor(filename: str) -> str:
        return f"/app/uploads/vendors/{filename}"

    def _make_local_url_for_store(filename: str) -> str:
        return f"/app/uploads/vendors/stores/{filename}"

    # ===== KTP =====
    if ktp is not None:
        ktp_filename = f"{user_id}_ktp"
        ktp_path = upload_base / ktp_filename
        async with aiofiles.open(str(ktp_path), "wb") as out_file:
            content = await ktp.read()
            await out_file.write(content)
        ktp_local_url = _make_local_url_for_vendor(ktp_filename)
    else:
        ktp_filename = "ktp_placeholder"
        ktp_path = upload_base / ktp_filename
        if not ktp_path.exists():
            async with aiofiles.open(str(ktp_path), "wb") as out_file:
                await out_file.write(b"")
        ktp_local_url = _make_local_url_for_vendor(ktp_filename)

    # ===== Selfie =====
    if selfie is not None:
        selfie_filename = f"{user_id}_selfie"
        selfie_path = upload_base / selfie_filename
        async with aiofiles.open(str(selfie_path), "wb") as out_file:
            content = await selfie.read()
            await out_file.write(content)
        selfie_local_url = _make_local_url_for_vendor(selfie_filename)
    else:
        selfie_filename = "selfie_placeholder"
        selfie_path = upload_base / selfie_filename
        if not selfie_path.exists():
            async with aiofiles.open(str(selfie_path), "wb") as out_file:
                await out_file.write(b"")
        selfie_local_url = _make_local_url_for_vendor(selfie_filename)

    # ===== Store image =====
    if store_img is not None:
        store_img_filename = f"{user_id}_store"
        store_img_path = stores_dir / store_img_filename
        async with aiofiles.open(str(store_img_path), "wb") as out_file:
            content = await store_img.read()
            await out_file.write(content)
        store_img_local_url = _make_local_url_for_store(store_img_filename)
    else:
        default_store_filename = "default_store_image"
        default_store_path = stores_dir / default_store_filename
        if not default_store_path.exists():
            async with aiofiles.open(str(default_store_path), "wb") as out_file:
                await out_file.write(b"")
        store_img_local_url = _make_local_url_for_store(default_store_filename)

    # Create vendor using schema
    vendor_data = VendorRegistrationData(
        user_id=user_id,
        ktp_image_url=ktp_local_url,
        selfie_image_url=selfie_local_url
    )
    result = post_new_vendor(
        vendor_data.user_id,
        vendor_data.ktp_image_url,
        vendor_data.selfie_image_url
    )

    # Create store using schema
    store_data = StoreRegistrationData(
        vendor_id=result.get("vendor_id"),
        name=store_name or f"Store of user {user_id}",
        description=store_description or "",
        category_id=category_id,
        address=address,
        is_halal=is_halal,
        open_time=open_time,
        close_time=close_time,
        store_image_url=store_img_local_url
    )
    store_result = post_new_vendor_store(
        vendor_id=store_data.vendor_id,
        name=store_data.name,
        description=store_data.description,
        category_id=store_data.category_id,
        address=store_data.address,
        is_halal=store_data.is_halal,
        open_time=store_data.open_time,
        close_time=store_data.close_time,
        store_image_url=store_data.store_image_url
    )

    return VendorStoreRegistrationResponse(
        message="Vendor and store registered successfully"
    )
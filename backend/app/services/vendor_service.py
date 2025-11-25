import time
from app.repositories.vendor_repo import insert_store_location


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

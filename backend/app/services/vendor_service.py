import time
import datetime
from app.repositories.vendor_repo import insert_store_location, get_store_locations
from app.database import init_db_pool

def interpolate(start_val, end_val, fraction):
    """Calculates a point between two values based on a fraction (0.0 to 1.0)."""
    return start_val + (end_val - start_val) * fraction

# --- The New Simulation Function ---

def interpolate(start_val, end_val, fraction):
    """Calculates a point between two values based on a fraction (0.0 to 1.0)."""
    return start_val + (end_val - start_val) * fraction

# --- The New Simulation Function ---

def simulate_movement(store_id, steps_per_segment, delay_seconds, path=None):
    """
    Simulates movement along a path, calling the database
    functions for each update.
    
    """
    
    if path is None:
        path = [
            {
                "name": "JIEXPO",
                "lon": 106.84602, 
                "lat": -6.15104
            },
            {
                "name": "Intersection",
                "lon": 106.84475,
                "lat": -6.15391
            },
            {
                "name": "RSUD Kemayoran",
                "lon": 106.84363,
                "lat": -6.15585
            }
        ]
    # --- END OF CHANGE ---
        
    print(f"--- STARTING SIMULATION for store_id: {store_id} ---")

    # Loop through each pair of points in the path
    for i in range(len(path) - 1):
        start_point = path[i]
        end_point = path[i+1]
        
        print(f"\n--- Segment: {start_point['name']} -> {end_point['name']} ---")
        
        # Loop through the "steps" for this segment
        for step in range(steps_per_segment + 1):
            # 1. Calculate the new interpolated point
            fraction = step / steps_per_segment
            current_lon = interpolate(start_point["lon"], end_point["lon"], fraction)
            current_lat = interpolate(start_point["lat"], end_point["lat"], fraction)
            
            # This is the object our simulation creates
            current_location_obj = {"lon": current_lon, "lat": current_lat}
            
            print(f"\n[APP] Step {step}/{steps_per_segment}: Sending update {current_location_obj}")
            
            # 2. Call your INSERT function
            try:
                insert_store_location(store_id, current_location_obj)
            except Exception as e:
                print(f"[APP] Error inserting: {e}")
                break
                
            # 3. Call your GET function to verify
            retrieved_data = get_store_locations(store_id)
            
            print(f"[APP] -> Verified Get: Latest location is ID {retrieved_data['location_id']} at {retrieved_data['location_point']}")
            
            if step < steps_per_segment:
                time.sleep(delay_seconds)

    print("\n--- SIMULATION FINISHED ---")


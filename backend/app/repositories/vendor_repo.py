from typing import List, Optional, Dict, Any
from app.database import get_cursor


def get_all_stores_with_locations() -> List[Dict[str, Any]]:
    """
    Lightweight function to get only store IDs and current locations.
    Used for polling to reduce data transfer.
    """
    sql = """
        SELECT 
            s.store_id,
            ST_Y(tsl.location::geometry) AS lat,
            ST_X(tsl.location::geometry) AS lon,
            tsl.created_at AS location_updated_at
        FROM gerobakku.stores s
        LEFT JOIN LATERAL (
            SELECT location, created_at
            FROM gerobakku.transactional_store_location
            WHERE store_id = s.store_id
            ORDER BY created_at DESC
            LIMIT 1
        ) tsl ON true
        WHERE tsl.location IS NOT NULL
        ORDER BY s.store_id;
    """
    
    try:
        with get_cursor() as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            
            locations = []
            for row in rows:
                locations.append({
                    'store_id': row[0],
                    'current_location': {
                        'lat': row[1],
                        'lon': row[2]
                    },
                    'location_updated_at': row[3]
                })
            
            return locations
    except Exception as e:
        print(f"Error fetching store locations: {e}")
        raise


def insert_store_location(store_id, location):
    """Insert a new location entry for a store."""
    sql = """
        INSERT INTO gerobakku.transactional_store_location
        (store_id, location)
        VALUES (%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography)
        RETURNING location_id, store_id, created_at, ST_AsText(location) AS location_point;
    """
    lon, lat = location['lon'], location['lat']
    
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(sql, (store_id, lon, lat))
            row = cur.fetchone()
            if not row:
                return None
            
            return {
                "location_id": row[0],
                "store_id": row[1],
                "created_at": row[2],
                "location_point": row[3]
            }
    except Exception as e:
        print(f"Error inserting store location: {e}")
        raise


def get_store_locations(store_id):
    """Get the latest location for a specific store."""
    sql = """
    SELECT location_id, store_id, created_at, ST_AsText(location) AS location_point
    FROM gerobakku.transactional_store_location
    WHERE store_id = %s
    ORDER BY location_id DESC
    LIMIT 1;
    """
    
    try:
        with get_cursor() as cur:
            cur.execute(sql, (store_id,))
            row = cur.fetchone()
            if not row:
                return None
            
            return {
                "location_id": row[0],
                "store_id": row[1],
                "created_at": row[2],
                "location_point": row[3]
            }
    except Exception as e:
        print(f"Error fetching store location: {e}")
        raise

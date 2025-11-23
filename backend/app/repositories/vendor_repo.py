from ..database import get_cursor

def insert_store_location(store_id, location):
    """
    Inserts a store location to the database as a PostGIS geography POINT (SRID 4326).

    Accepts `location` as either:
        - a tuple/list (lon, lat)
        - a dict with keys `lat` and `lon` (or `lng` for longitude)

    Returns the inserted row (via RETURNING *).
    """

    sql = """
        INSERT INTO gerobakku.transactional_store_location
        (store_id, location)
        VALUES (%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography)
        RETURNING location_id, store_id, created_at, ST_AsText(location) AS location_point;
    """

    try:
        # normalize location input to (lon, lat)
        lon = lat = None
        if isinstance(location, dict):
            if 'lon' in location:
                lon = location['lon']
            elif 'lng' in location:
                lon = location['lng']
            if 'lat' in location:
                lat = location['lat']
        elif isinstance(location, (list, tuple)) and len(location) >= 2:
            lon, lat = location[0], location[1]
        else:
            raise ValueError("location must be (lon, lat) tuple/list or {'lat':..., 'lon':...}")
        
        if lon is None or lat is None:
            raise ValueError(
                "Incomplete location. Must provide both lat and lon/lng."
            )
        
        with get_cursor(commit=True) as cur:
            # avoid server-side prepared-statement name collisions by disabling
            # automatic preparation for repeated identical statements in this
            # simple repo layer usage.
            cur.execute(sql, (store_id, lon, lat), prepare=False)
            row = cur.fetchone()
            if row is None:
                return None
            # map to dict using cursor description
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))

    except Exception as e:
        print(f"Error fetching store locations: {e}")		
        raise

def get_store_locations(store_id):
    sql = """
    SELECT location_id, store_id, created_at, ST_AsText(location) AS location_point
    FROM gerobakku.transactional_store_location
    WHERE store_id = %s
    ORDER BY location_id DESC
    LIMIT 1;
    """
    try:
        with get_cursor() as cur:
            # disable server-side prepared statements here as well to avoid
            # "prepared statement ... already exists" errors when the pool
            # reuses connections.
            cur.execute(sql, (store_id,), prepare=False)
            row = cur.fetchone()
            if row is None:
                return None
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))
    except Exception as e:
        print(f"Error fetching store locations: {e}")
        raise

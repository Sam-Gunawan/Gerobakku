from ..database import get_cursor
from typing import Optional, Dict, Any, List


# ===== STORE CRUD OPERATIONS =====

def get_all_stores() -> List[Dict[str, Any]]:
    """
    Fetch all stores with their latest location.
    Returns a list of store dictionaries with current_location as {lat, lon}.
    """
    sql = """
        SELECT 
            s.store_id,
            s.vendor_id,
            s.name,
            s.description,
            s.rating,
            s.category_id,
            s.address,
            s.is_open,
            s.is_halal,
            s.open_time,
            s.close_time,
            s.created_at,
            s.store_image_url,
            ST_Y(l.location::geometry) AS lat,
            ST_X(l.location::geometry) AS lon,
            l.created_at AS location_updated_at
        FROM gerobakku.stores s
        LEFT JOIN LATERAL (
            SELECT location, created_at
            FROM gerobakku.transactional_store_location
            WHERE store_id = s.store_id
            ORDER BY created_at DESC
            LIMIT 1
        ) l ON true
        ORDER BY s.store_id;
    """
    try:
        with get_cursor() as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            if not rows:
                return []
            
            cols = [d[0] for d in cur.description]
            stores = []
            for row in rows:
                store_dict = dict(zip(cols, row))
                # Convert location to nested object
                if store_dict.get('lat') is not None and store_dict.get('lon') is not None:
                    store_dict['current_location'] = {
                        'lat': store_dict.pop('lat'),
                        'lon': store_dict.pop('lon')
                    }
                else:
                    store_dict['current_location'] = None
                    store_dict.pop('lat', None)
                    store_dict.pop('lon', None)
                stores.append(store_dict)
            return stores
    except Exception as e:
        print(f"Error fetching all stores: {e}")
        raise


def get_store_by_id(store_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetch a single store by ID with its latest location.
    """
    sql = """
        SELECT 
            s.store_id,
            s.vendor_id,
            s.name,
            s.description,
            s.rating,
            s.category_id,
            s.address,
            s.is_open,
            s.is_halal,
            s.open_time,
            s.close_time,
            s.created_at,
            s.store_image_url,
            ST_Y(l.location::geometry) AS lat,
            ST_X(l.location::geometry) AS lon,
            l.created_at AS location_updated_at
        FROM gerobakku.stores s
        LEFT JOIN LATERAL (
            SELECT location, created_at
            FROM gerobakku.transactional_store_location
            WHERE store_id = s.store_id
            ORDER BY created_at DESC
            LIMIT 1
        ) l ON true
        WHERE s.store_id = %s;
    """
    try:
        with get_cursor() as cur:
            cur.execute(sql, (store_id,))
            row = cur.fetchone()
            if not row:
                return None
            
            cols = [d[0] for d in cur.description]
            store_dict = dict(zip(cols, row))
            
            # Convert location to nested object
            if store_dict.get('lat') is not None and store_dict.get('lon') is not None:
                store_dict['current_location'] = {
                    'lat': store_dict.pop('lat'),
                    'lon': store_dict.pop('lon')
                }
            else:
                store_dict['current_location'] = None
                store_dict.pop('lat', None)
                store_dict.pop('lon', None)
            
            return store_dict
    except Exception as e:
        print(f"Error fetching store {store_id}: {e}")
        raise


def create_store(vendor_id: int, name: str, description: str, category_id: int,
                 address: str, is_halal: bool, open_time: int, close_time: int,
                 store_image_url: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Create a new store.
    Returns the created store dictionary.
    """
    sql = """
        INSERT INTO gerobakku.stores (
            store_id, vendor_id, name, description, rating, category_id,
            address, is_open, is_halal, open_time, close_time, created_at, store_image_url
        ) VALUES (
            (SELECT COALESCE(MAX(store_id), 300) + 1 FROM gerobakku.stores),
            %s, %s, %s, 0.0, %s, %s, false, %s, %s, %s, NOW(), %s
        )
        RETURNING store_id, vendor_id, name, description, rating, category_id,
                  address, is_open, is_halal, open_time, close_time, created_at, store_image_url;
    """
    try:
        with get_cursor(commit=True) as cur:
            # Revert to default image path for demonstration purposes
            cur.execute(sql, (vendor_id, name, description, category_id, address,
                            is_halal, open_time, close_time, "assets/default_store_image.jpg"))
            row = cur.fetchone()
            if not row:
                return None
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))
    except Exception as e:
        print(f"Error creating store: {e}")
        raise


def update_store(store_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """
    Update store details. Accepts kwargs for fields to update.
    Valid fields: name, description, category_id, address, is_halal, 
                  open_time, close_time, store_image_url
    """
    allowed_fields = ['name', 'description', 'category_id', 'address', 
                     'is_halal', 'open_time', 'close_time', 'store_image_url']
    
    # Filter only allowed fields that are provided
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields and v is not None}
    
    if not updates:
        # No valid updates provided, just return the current store
        return get_store_by_id(store_id)
    
    # Build SET clause
    set_clause = ', '.join([f'"{k}" = %s' for k in updates.keys()])
    values = list(updates.values())
    values.append(store_id)  # For WHERE clause
    
    sql = f"""
        UPDATE gerobakku.stores
        SET {set_clause}
        WHERE store_id = %s
        RETURNING store_id, vendor_id, name, description, rating, category_id,
                  address, is_open, is_halal, open_time, close_time, created_at, store_image_url;
    """
    
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(sql, values)
            row = cur.fetchone()
            if not row:
                return None
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))
    except Exception as e:
        print(f"Error updating store {store_id}: {e}")
        raise


def update_store_hours(store_id: int, open_time: int, close_time: int) -> Optional[Dict[str, Any]]:
    """
    Update store operating hours.
    """
    return update_store(store_id, open_time=open_time, close_time=close_time)


def set_store_open_status(store_id: int, is_open: bool) -> Optional[Dict[str, Any]]:
    """
    Explicitly set store open/close status.
    """
    sql = """
        UPDATE gerobakku.stores
        SET is_open = %s
        WHERE store_id = %s
        RETURNING store_id, vendor_id, name, description, rating, category_id,
                  address, is_open, is_halal, open_time, close_time, created_at, store_image_url;
    """
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(sql, (is_open, store_id))
            row = cur.fetchone()
            if not row:
                return None
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))
    except Exception as e:
        print(f"Error setting store {store_id} open status: {e}")
        raise


def set_store_halal_status(store_id: int, is_halal: bool) -> Optional[Dict[str, Any]]:
    """
    Update halal certification status.
    """
    return update_store(store_id, is_halal=is_halal)


def delete_store(store_id: int) -> bool:
    """
    Hard delete a store from the database.
    Due to foreign key constraints, this will cascade delete:
    - All menu items for this store
    - All location history for this store
    - All reviews for this store
    - All favorites for this store
    """
    sql = "DELETE FROM gerobakku.stores WHERE store_id = %s;"
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(sql, (store_id,))
            return cur.rowcount > 0
    except Exception as e:
        print(f"Error deleting store {store_id}: {e}")
        raise


# ===== MENU ITEM OPERATIONS =====

def get_store_menu(store_id: int) -> List[Dict[str, Any]]:
    """
    Fetch all menu items for a specific store.
    """
    sql = """
        SELECT item_id, store_id, name, description, price, 
               is_available, menu_image_url, created_at
        FROM gerobakku.menu_items
        WHERE store_id = %s
        ORDER BY item_id;
    """
    try:
        with get_cursor() as cur:
            cur.execute(sql, (store_id,))
            rows = cur.fetchall()
            if not rows:
                return []
            cols = [d[0] for d in cur.description]
            return [dict(zip(cols, row)) for row in rows]
    except Exception as e:
        print(f"Error fetching menu for store {store_id}: {e}")
        raise


def create_menu_item(store_id: int, name: str, description: str, price: float,
                     is_available: bool = True, menu_image_url: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Add a new menu item to a store.
    """
    sql = """
        INSERT INTO gerobakku.menu_items (
            item_id, store_id, name, description, price, is_available, menu_image_url, created_at
        ) VALUES (
            (SELECT COALESCE(MAX(item_id), 1000) + 1 FROM gerobakku.menu_items),
            %s, %s, %s, %s, %s, %s, NOW()
        )
        RETURNING item_id, store_id, name, description, price, is_available, menu_image_url, created_at;
    """
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(sql, (store_id, name, description, price, is_available, menu_image_url))
            row = cur.fetchone()
            if not row:
                return None
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))
    except Exception as e:
        print(f"Error creating menu item: {e}")
        raise


def update_menu_item(item_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """
    Update menu item details.
    Valid fields: name, description, price, is_available, menu_image_url
    """
    allowed_fields = ['name', 'description', 'price', 'is_available', 'menu_image_url']
    
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields and v is not None}
    
    if not updates:
        # Return current item if no updates
        sql = "SELECT * FROM gerobakku.menu_items WHERE item_id = %s;"
        with get_cursor() as cur:
            cur.execute(sql, (item_id,))
            row = cur.fetchone()
            if not row:
                return None
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))
    
    set_clause = ', '.join([f'"{k}" = %s' for k in updates.keys()])
    values = list(updates.values())
    values.append(item_id)
    
    sql = f"""
        UPDATE gerobakku.menu_items
        SET {set_clause}
        WHERE item_id = %s
        RETURNING item_id, store_id, name, description, price, is_available, menu_image_url, created_at;
    """
    
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(sql, values)
            row = cur.fetchone()
            if not row:
                return None
            cols = [d[0] for d in cur.description]
            return dict(zip(cols, row))
    except Exception as e:
        print(f"Error updating menu item {item_id}: {e}")
        raise


def update_menu_item_availability(item_id: int, is_available: bool) -> Optional[Dict[str, Any]]:
    """
    Toggle menu item availability.
    """
    return update_menu_item(item_id, is_available=is_available)


def delete_menu_item(item_id: int) -> bool:
    """
    Delete a menu item.
    """
    sql = "DELETE FROM gerobakku.menu_items WHERE item_id = %s;"
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(sql, (item_id,))
            return cur.rowcount > 0
    except Exception as e:
        print(f"Error deleting menu item {item_id}: {e}")
        raise


def get_store_by_vendor_id(vendor_id: int) -> dict:
    """Get store by vendor_id"""
    with get_cursor() as cur:
        cur.execute("""
            SELECT store_id, name
            FROM gerobakku.stores
            WHERE vendor_id = %s
            LIMIT 1
        """, (vendor_id,))
        
        row = cur.fetchone()
        if not row:
            return None
        
        return {
            'store_id': row[0],
            'name': row[1]
        }
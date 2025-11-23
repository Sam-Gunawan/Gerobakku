from typing import List, Optional
from app.repositories import store_repo
from app.schemas.store_schema import (
    StoreResponse, StoreWithMenuResponse, MenuItemResponse,
    StoreCreate, StoreUpdate, StoreHoursUpdate,
    StoreOpenStatusUpdate, StoreHalalStatusUpdate,
    MenuItemCreate, MenuItemUpdate
)


def get_all_stores_with_locations() -> List[StoreResponse]:
    """
    Get all stores with their current locations.
    """
    stores = store_repo.get_all_stores()
    return [StoreResponse(**store) for store in stores]


def get_store_details(store_id: int) -> Optional[StoreWithMenuResponse]:
    """
    Get store details including menu items.
    """
    store = store_repo.get_store_by_id(store_id)
    if not store:
        return None
    
    menu_items = store_repo.get_store_menu(store_id)
    menu = [MenuItemResponse(**item) for item in menu_items]
    
    return StoreWithMenuResponse(**store, menu=menu)


def get_store_menu_items(store_id: int) -> List[MenuItemResponse]:
    """
    Get menu items for a store.
    """
    items = store_repo.get_store_menu(store_id)
    return [MenuItemResponse(**item) for item in items]


def create_new_store(store_data: StoreCreate) -> StoreResponse:
    """
    Create a new store.
    """
    store = store_repo.create_store(
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
    if not store:
        raise Exception("Failed to create store")
    return StoreResponse(**store)


def update_store_details(store_id: int, update_data: StoreUpdate) -> Optional[StoreResponse]:
    """
    Update store details.
    """
    # Convert Pydantic model to dict, excluding None values
    update_dict = update_data.model_dump(exclude_none=True)
    
    store = store_repo.update_store(store_id, **update_dict)
    if not store:
        return None
    return StoreResponse(**store)


def update_operating_hours(store_id: int, hours_data: StoreHoursUpdate) -> Optional[StoreResponse]:
    """
    Update store operating hours.
    """
    store = store_repo.update_store_hours(store_id, hours_data.open_time, hours_data.close_time)
    if not store:
        return None
    return StoreResponse(**store)


def set_open_status(store_id: int, status_data: StoreOpenStatusUpdate) -> Optional[StoreResponse]:
    """
    Set store open/close status.
    """
    store = store_repo.set_store_open_status(store_id, status_data.is_open)
    if not store:
        return None
    return StoreResponse(**store)


def set_halal_status(store_id: int, halal_data: StoreHalalStatusUpdate) -> Optional[StoreResponse]:
    """
    Update halal certification status.
    """
    store = store_repo.set_store_halal_status(store_id, halal_data.is_halal)
    if not store:
        return None
    return StoreResponse(**store)


def remove_store(store_id: int) -> bool:
    """
    Delete a store (hard delete).
    """
    return store_repo.delete_store(store_id)


def add_menu_item(item_data: MenuItemCreate) -> MenuItemResponse:
    """
    Add a new menu item to a store.
    """
    item = store_repo.create_menu_item(
        store_id=item_data.store_id,
        name=item_data.name,
        description=item_data.description,
        price=item_data.price,
        is_available=item_data.is_available,
        menu_image_url=item_data.menu_image_url
    )
    if not item:
        raise Exception("Failed to create menu item")
    return MenuItemResponse(**item)


def update_existing_menu_item(item_id: int, update_data: MenuItemUpdate) -> Optional[MenuItemResponse]:
    """
    Update menu item details.
    """
    update_dict = update_data.model_dump(exclude_none=True)
    
    item = store_repo.update_menu_item(item_id, **update_dict)
    if not item:
        return None
    return MenuItemResponse(**item)


def toggle_menu_availability(item_id: int, is_available: bool) -> Optional[MenuItemResponse]:
    """
    Toggle menu item availability.
    """
    item = store_repo.update_menu_item_availability(item_id, is_available)
    if not item:
        return None
    return MenuItemResponse(**item)


def remove_menu_item(item_id: int) -> bool:
    """
    Delete a menu item.
    """
    return store_repo.delete_menu_item(item_id)

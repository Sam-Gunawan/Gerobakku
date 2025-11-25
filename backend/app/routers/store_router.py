from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.services import store_service
from app.schemas.store_schema import (
    StoreResponse, StoreWithMenuResponse, MenuItemResponse,
    StoreCreate, StoreUpdate, StoreHoursUpdate,
    StoreOpenStatusUpdate, StoreHalalStatusUpdate,
    MenuItemCreate, MenuItemUpdate
)
from app.security import get_current_user
from app.schemas.user_schema import User

router = APIRouter(prefix="/stores", tags=["stores"])


# ===== PUBLIC ENDPOINTS =====

@router.get("", response_model=List[StoreResponse], status_code=status.HTTP_200_OK)
async def get_all_stores():
    """
    Get all stores with their current locations (for map display).
    Public endpoint - no authentication required.
    """
    try:
        stores = store_service.get_all_stores_with_locations()
        return stores
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stores: {str(e)}"
        )


@router.get("/{store_id}", response_model=StoreWithMenuResponse, status_code=status.HTTP_200_OK)
async def get_store_details(store_id: int):
    """
    Get single store details including menu items.
    Public endpoint - no authentication required.
    """
    try:
        store = store_service.get_store_details(store_id)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store {store_id} not found"
            )
        return store
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch store: {str(e)}"
        )


@router.get("/{store_id}/menu", response_model=List[MenuItemResponse], status_code=status.HTTP_200_OK)
async def get_store_menu(store_id: int):
    """
    Get menu items for a specific store.
    Public endpoint - no authentication required.
    """
    try:
        menu = store_service.get_store_menu_items(store_id)
        return menu
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch menu: {str(e)}"
        )


# ===== VENDOR/SELLER ENDPOINTS (AUTHENTICATED) =====

@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def create_store(
    store_data: StoreCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new store.
    Requires authentication.
    """
    try:
        store = store_service.create_new_store(store_data)
        return store
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create store: {str(e)}"
        )


@router.put("/{store_id}", response_model=StoreResponse, status_code=status.HTTP_200_OK)
async def update_store(
    store_id: int,
    update_data: StoreUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update store details (name, description, address, etc.).
    Requires authentication.
    """
    try:
        store = store_service.update_store_details(store_id, update_data)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store {store_id} not found"
            )
        return store
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update store: {str(e)}"
        )


@router.put("/{store_id}/hours", response_model=StoreResponse, status_code=status.HTTP_200_OK)
async def update_store_hours(
    store_id: int,
    hours_data: StoreHoursUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update store operating hours.
    Requires authentication.
    """
    try:
        store = store_service.update_operating_hours(store_id, hours_data)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store {store_id} not found"
            )
        return store
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update hours: {str(e)}"
        )


@router.put("/{store_id}/open", response_model=StoreResponse, status_code=status.HTTP_200_OK)
async def open_store(
    store_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Explicitly open the store (set is_open=true).
    Requires authentication.
    """
    try:
        store = store_service.set_open_status(store_id, StoreOpenStatusUpdate(is_open=True))
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store {store_id} not found"
            )
        return store
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to open store: {str(e)}"
        )


@router.put("/{store_id}/close", response_model=StoreResponse, status_code=status.HTTP_200_OK)
async def close_store(
    store_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Explicitly close the store (set is_open=false).
    Requires authentication.
    """
    try:
        store = store_service.set_open_status(store_id, StoreOpenStatusUpdate(is_open=False))
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store {store_id} not found"
            )
        return store
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to close store: {str(e)}"
        )


@router.put("/{store_id}/halal", response_model=StoreResponse, status_code=status.HTTP_200_OK)
async def update_halal_status(
    store_id: int,
    halal_data: StoreHalalStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update halal certification status.
    Requires authentication.
    """
    try:
        store = store_service.set_halal_status(store_id, halal_data)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store {store_id} not found"
            )
        return store
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update halal status: {str(e)}"
        )


@router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_store(
    store_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a store (hard delete - will cascade delete menu items, locations, etc.).
    Requires authentication.
    """
    try:
        success = store_service.remove_store(store_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store {store_id} not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete store: {str(e)}"
        )


# ===== MENU ITEM ENDPOINTS (AUTHENTICATED) =====

@router.post("/{store_id}/menu", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def add_menu_item(
    store_id: int,
    item_data: MenuItemCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Add a new menu item to the store.
    Requires authentication.
    """
    # Ensure the store_id in the path matches the one in the body
    if item_data.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store ID in path must match store ID in request body"
        )
    
    try:
        item = store_service.add_menu_item(item_data)
        return item
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add menu item: {str(e)}"
        )


@router.put("/{store_id}/menu/{item_id}", response_model=MenuItemResponse, status_code=status.HTTP_200_OK)
async def update_menu_item(
    store_id: int,
    item_id: int,
    update_data: MenuItemUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update menu item details.
    Requires authentication.
    """
    try:
        item = store_service.update_existing_menu_item(item_id, update_data)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item {item_id} not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update menu item: {str(e)}"
        )


@router.delete("/{store_id}/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    store_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a menu item.
    Requires authentication.
    """
    try:
        success = store_service.remove_menu_item(item_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item {item_id} not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete menu item: {str(e)}"
        )


@router.put("/{store_id}/menu/{item_id}/availability", response_model=MenuItemResponse, status_code=status.HTTP_200_OK)
async def toggle_menu_item_availability(
    store_id: int,
    item_id: int,
    is_available: bool,
    current_user: User = Depends(get_current_user)
):
    """
    Toggle menu item availability.
    Requires authentication.
    """
    try:
        item = store_service.toggle_menu_availability(item_id, is_available)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item {item_id} not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle availability: {str(e)}"
        )

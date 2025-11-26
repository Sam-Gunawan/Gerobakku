from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ----- Location Schemas -----

class LocationPoint(BaseModel):
    """Geographic point with latitude and longitude"""
    lat: float
    lon: float


class StoreLocationResponse(BaseModel):
    """Response for store location data"""
    location_id: int
    store_id: int
    location: LocationPoint
    created_at: datetime


# ----- Menu Item Schemas -----

class MenuItemBase(BaseModel):
    """Base menu item fields"""
    name: str
    description: str
    price: float
    is_available: bool = True
    menu_image_url: Optional[str] = None


class MenuItemCreate(MenuItemBase):
    """Schema for creating a menu item"""
    store_id: int


class MenuItemUpdate(BaseModel):
    """Schema for updating a menu item (all fields optional)"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_available: Optional[bool] = None
    menu_image_url: Optional[str] = None


class MenuItemResponse(MenuItemBase):
    """Response schema for menu item"""
    item_id: int
    store_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Store Schemas -----

class StoreBase(BaseModel):
    """Base store fields"""
    name: str
    description: str
    category_id: int
    address: str
    is_halal: bool = False
    open_time: int  # Hour in 24-hour format (0-23)
    close_time: int  # Hour in 24-hour format (0-23)
    store_image_url: Optional[str] = None


class StoreCreate(StoreBase):
    """Schema for creating a store"""
    vendor_id: int


class StoreUpdate(BaseModel):
    """Schema for updating store details (all fields optional)"""
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    address: Optional[str] = None
    is_halal: Optional[bool] = None
    open_time: Optional[int] = None
    close_time: Optional[int] = None
    store_image_url: Optional[str] = None


class StoreHoursUpdate(BaseModel):
    """Schema for updating store operating hours"""
    open_time: int
    close_time: int


class StoreOpenStatusUpdate(BaseModel):
    """Schema for explicitly setting store open/close status"""
    is_open: bool


class StoreHalalStatusUpdate(BaseModel):
    """Schema for updating halal certification status"""
    is_halal: bool


class StoreResponse(StoreBase):
    """Response schema for store with location"""
    store_id: int
    vendor_id: int
    rating: float
    is_open: bool
    created_at: datetime
    current_location: Optional[LocationPoint] = None
    location_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StoreWithMenuResponse(StoreResponse):
    """Store response including menu items"""
    menu: list[MenuItemResponse] = []
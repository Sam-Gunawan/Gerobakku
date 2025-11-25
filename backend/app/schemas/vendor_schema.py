from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LocationPoint(BaseModel):
    """Geographic coordinates"""
    lat: float
    lon: float

class StoreLocationUpdate(BaseModel):
    """Lightweight schema for location-only updates"""
    store_id: int
    current_location: LocationPoint
    location_updated_at: datetime

class VendorBase(BaseModel):
    """Base vendor/seller fields"""
    ktp_image_url: Optional[str] = None
    selfie_image_url: Optional[str] = None
    is_verified: bool = False

class VendorResponse(VendorBase):
    """Response schema for vendor"""
    vendor_id: int
    user_id: int
    is_verified: bool = False

class VendorLocationUpdate(BaseModel):
    """Schema for updating vendor location"""
    longitude: float
    latitude: float

class VendorRegistrationData(BaseModel):
    """Internal schema for vendor registration data"""
    user_id: int
    ktp_image_url: str
    selfie_image_url: str

class StoreRegistrationData(BaseModel):
    """Internal schema for store registration data"""
    vendor_id: int
    name: str
    description: str
    category_id: Optional[int] = None
    address: Optional[str] = None
    is_halal: Optional[bool] = None
    open_time: Optional[int] = None
    close_time: Optional[int] = None
    store_image_url: str

class VendorStoreRegistrationResponse(BaseModel):
    """Response for vendor and store registration"""
    message: str
    vendor_id: int
    store_id: Optional[int] = None

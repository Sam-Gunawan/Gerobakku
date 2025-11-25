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

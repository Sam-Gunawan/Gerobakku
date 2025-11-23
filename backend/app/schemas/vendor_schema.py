from pydantic import BaseModel
from typing import Optional


class VendorBase(BaseModel):
    """Base vendor/seller fields"""
    ktp_image_url: Optional[str] = None
    selfie_image_url: Optional[str] = None


class VendorCreate(VendorBase):
    """Schema for creating a vendor"""
    user_id: int


class VendorResponse(VendorBase):
    """Response schema for vendor"""
    vendor_id: int
    user_id: int
    is_verified: bool = False

    class Config:
        from_attributes = True


class VendorLocationUpdate(BaseModel):
    """Schema for updating vendor location"""
    lat: float
    lon: float

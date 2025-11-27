from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from fastapi import Form

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

class VendorLocationUpdate(BaseModel):
    """Schema for updating vendor location"""
    longitude: float
    latitude: float

class VendorRegistrationData(BaseModel):
    """Internal schema for vendor registration data"""
    user_id: int
    ktp_image_url: str
    selfie_image_url: str



class VendorStoreRegistrationForm(BaseModel):
    """Form data for vendor and store registration (excluding file uploads)"""
    user_id: int = Form(...)
    store_name: str = Form(...)
    store_description: str = Form(...)
    category_id: int = Form(...)
    address: str = Form(...)
    is_halal: bool = Form(...)
    open_time: int = Form(...)
    close_time: int = Form(...)
    latitude: Optional[float] = Form(None)
    longitude: Optional[float] = Form(None)

    @field_validator('*')
    @classmethod
    def validate_not_empty(cls, v, info):
        """Ensure all string fields are not empty or whitespace-only"""
        if isinstance(v, str):
            v_stripped = v.strip()
            if not v_stripped:
                raise ValueError(f'{info.field_name} cannot be empty')
            return v_stripped
        return v

    @classmethod
    def as_form(
        cls,
        user_id: int = Form(...),
        store_name: str = Form(...),
        store_description: str = Form(...),
        category_id: int = Form(...),
        address: str = Form(...),
        is_halal: bool = Form(...),
        open_time: int = Form(...),
        close_time: int = Form(...),
        latitude: Optional[float] = Form(None),
        longitude: Optional[float] = Form(None)
    ) -> "VendorStoreRegistrationForm":
        """Helper to use this Pydantic model with FastAPI form-data.

        Use in router as: Depends(VendorStoreRegistrationForm.as_form)
        """
        return cls(
            user_id=user_id,
            store_name=store_name,
            store_description=store_description,
            category_id=category_id,
            address=address,
            is_halal=is_halal,
            open_time=open_time,
            close_time=close_time,
            latitude=latitude,
            longitude=longitude 
        )


class VendorStoreRegistrationResponse(BaseModel):
    """Response returned after registering a vendor and store"""
    message: str
    vendor_id: int
    store_id: int

    class Config:
        from_attributes = True

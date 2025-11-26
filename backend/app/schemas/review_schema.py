from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    """Base review fields"""
    score: int  # 1-5
    comment: str

class ReviewCreate(ReviewBase):
    """Schema for creating a review"""
    store_id: int

class ReviewResponse(ReviewBase):
    """Response schema for review with user info"""
    rating_id: int
    user_id: int
    store_id: int
    reviewer_name: str  # User's full name
    created_at: datetime
    class Config:
        from_attributes = True

class ReviewStatsResponse(BaseModel):
    """Aggregated review statistics"""
    average_rating: float
    total_reviews: int
    rating_distribution: dict  # {5: count, 4: count, ...}
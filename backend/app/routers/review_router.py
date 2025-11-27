from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.review_schema import (
    ReviewCreate,
    ReviewResponse,
    ReviewStatsResponse
)
from app.services import review_service
from app.security import get_current_user
from app.schemas.user_schema import User


router = APIRouter(prefix="/stores", tags=["reviews"])
@router.post("/{store_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)

async def submit_review(
    store_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Submit a review for a store.
    Requires authentication.
    """
    # Validate store_id matches
    if review_data.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store ID in path must match store ID in request body"
        )
    
    try:
        review = review_service.submit_review(
            user_id=int(current_user.user_id),
            store_id=store_id,
            score=review_data.score,
            comment=review_data.comment
        )
        return ReviewResponse(**review)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit review: {str(e)}"
        )

@router.get("/{store_id}/reviews", response_model=List[ReviewResponse], status_code=status.HTTP_200_OK)
async def get_store_reviews(store_id: int):
    """
    Get all reviews for a specific store.
    Public endpoint - no authentication required.
    """
    try:
        reviews = review_service.get_store_reviews(store_id)
        return [ReviewResponse(**review) for review in reviews]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reviews: {str(e)}"
        )

@router.get("/{store_id}/reviews/stats", response_model=ReviewStatsResponse, status_code=status.HTTP_200_OK)
async def get_review_stats(store_id: int):
    """
    Get aggregated review statistics for a store.
    Public endpoint - no authentication required.
    """
    try:
        stats = review_service.get_store_review_stats(store_id)
        return ReviewStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch review stats: {str(e)}"
        )

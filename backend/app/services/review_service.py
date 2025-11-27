from ..repositories import review_repo
from typing import List


def submit_review(user_id: int, store_id: int, score: int, comment: str) -> dict:
    """
    Submit a review for a store.
    
    Args:
        user_id: The user submitting the review
        store_id: The store being reviewed
        score: Rating from 1-5
        comment: Review text
    
    Returns:
        Created review data
    
    Raises:
        ValueError: If invalid score
    """
    # Validate score
    if not 1 <= score <= 5:
        raise ValueError("Score must be between 1 and 5")
    
    # Validate comment
    if not comment or not comment.strip():
        raise ValueError("Comment cannot be empty")
    
    # Create review (simplified - no customer_id check needed)
    review = review_repo.create_review(user_id, store_id, score, comment.strip())
    
    # Update store's average rating
    review_repo.update_store_rating(store_id)
    
    return review

def get_store_reviews(store_id: int) -> List[dict]:
    """Get all reviews for a store"""
    return review_repo.get_store_reviews(store_id)
    
def get_store_review_stats(store_id: int) -> dict:
    """Get aggregated review statistics"""
    return review_repo.get_review_stats(store_id)

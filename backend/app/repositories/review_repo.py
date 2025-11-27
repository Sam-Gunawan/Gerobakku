from ..database import get_cursor
from typing import List, Dict, Optional


def create_review(user_id: int, store_id: int, score: int, comment: str) -> dict:
    """Insert a new review and return the created review"""
    with get_cursor(commit=True) as cur:
        # Insert review (created_at has default value, rating_id auto-generated)
        cur.execute("""
            INSERT INTO gerobakku.transactional_reviews 
            (user_id, store_id, score, comment)
            VALUES (%s, %s, %s, %s)
            RETURNING rating_id, user_id, store_id, score, comment, created_at
        """, (user_id, store_id, score, comment))
        
        row = cur.fetchone()
        if not row:
            return None
        
        # Get reviewer name
        cur.execute("""
            SELECT full_name
            FROM gerobakku.users
            WHERE user_id = %s
        """, (user_id,))
        
        name_row = cur.fetchone()
        reviewer_name = name_row[0] if name_row else "Anonymous"
        
        return {
            'rating_id': row[0],
            'user_id': row[1],
            'store_id': row[2],
            'score': row[3],
            'comment': row[4],
            'created_at': row[5],
            'reviewer_name': reviewer_name
        }

def get_store_reviews(store_id: int) -> List[dict]:
    """Get all reviews for a store with reviewer names"""
    with get_cursor() as cur:
        cur.execute("""
            SELECT 
                r.rating_id,
                r.user_id,
                r.store_id,
                r.score,
                r.comment,
                r.created_at,
                u.full_name as reviewer_name
            FROM gerobakku.transactional_reviews r
            JOIN gerobakku.users u ON r.user_id = u.user_id
            WHERE r.store_id = %s
            ORDER BY r.created_at DESC
        """, (store_id,))
        
        rows = cur.fetchall()
        return [{
            'rating_id': row[0],
            'user_id': row[1],
            'store_id': row[2],
            'score': row[3],
            'comment': row[4],
            'created_at': row[5],
            'reviewer_name': row[6]
        } for row in rows]

def get_review_stats(store_id: int) -> dict:
    """Get aggregated review statistics for a store"""
    with get_cursor() as cur:
        # Get rating distribution
        cur.execute("""
            SELECT score, COUNT(*) as count
            FROM gerobakku.transactional_reviews
            WHERE store_id = %s
            GROUP BY score
        """, (store_id,))
        
        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        total = 0
        weighted_sum = 0

        rows = cur.fetchall()
        
        # Check if no reviews, send 0s
        if not rows:
            # No reviews yet
            return {
                'average_rating': 0.0,
                'total_reviews': 0,
                'rating_distribution': distribution
            }

        for row in rows:
            score, count = row[0], row[1]
            distribution[score] = count
            total += count
            weighted_sum += score * count
        
        average = weighted_sum / total if total > 0 else 0.0
        
        return {
            'average_rating': round(average, 1),
            'total_reviews': total,
            'rating_distribution': distribution
        }

def update_store_rating(store_id: int):
    """Update the store's average rating based on reviews"""
    stats = get_review_stats(store_id)
    
    with get_cursor(commit=True) as cur:
        cur.execute("""
            UPDATE gerobakku.stores
            SET rating = %s
            WHERE store_id = %s
        """, (stats['average_rating'], store_id))

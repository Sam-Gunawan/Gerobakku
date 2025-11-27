import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Review, ReviewStats, ReviewSubmission } from '../models/review.model';
import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private readonly API_URL = environment.apiUrl || 'http://localhost:8000';
    constructor(private http: HttpClient) { }

    submitReview(review: ReviewSubmission): Observable<Review> {
        return this.http.post<any>(`${this.API_URL}/stores/${review.storeId}/reviews`, {
            store_id: review.storeId,
            score: review.score,
            comment: review.comment
        }).pipe(
            map(apiReview => this.transformReview(apiReview))
        );
    }

    getStoreReviews(storeId: string | number): Observable<Review[]> {
        return this.http.get<any[]>(`${this.API_URL}/stores/${storeId}/reviews`).pipe(
            map(reviews => reviews.map(r => this.transformReview(r)))
        );
    }

    getReviewStats(storeId: string | number): Observable<ReviewStats> {
        return this.http.get<any>(`${this.API_URL}/stores/${storeId}/reviews/stats`).pipe(
            map(stats => ({
                averageRating: stats.average_rating,
                totalReviews: stats.total_reviews,
                ratingDistribution: stats.rating_distribution
            }))
        );
    }

    private transformReview(apiReview: any): Review {
        return {
            ratingId: apiReview.rating_id,
            userId: apiReview.user_id,
            storeId: apiReview.store_id,
            score: apiReview.score,
            comment: apiReview.comment,
            reviewerName: apiReview.reviewer_name,
            createdAt: new Date(apiReview.created_at)
        };
    }
}
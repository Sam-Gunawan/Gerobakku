import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../models/store.model';
import { AddReviewModalComponent } from '../add-review-modal/add-review-modal.component';
import { ReviewService } from '../../../services/review.service';
import { Review, ReviewStats } from '../../../models/review.model';
import { AuthService } from '../../../services/auth.service'
import { formatTimeRange } from '../../utils/time-formatter';

@Component({
    selector: 'app-store-details',
    standalone: true,
    imports: [CommonModule, AddReviewModalComponent],
    templateUrl: './store-details.component.html',
    styleUrl: './store-details.component.scss'
})
export class StoreDetailsComponent implements OnChanges {
    @Input() store?: Store;
    @Input() hasActiveRoute: boolean = false;
    @Output() close = new EventEmitter<void>();
    @Output() guideMe = new EventEmitter<Store>();

    reviews: Review[] = [];
    reviewStats: ReviewStats | null = null;
    isLoadingReviews = false;
    showAddReviewModal = false;
    isSubmittingReview = false;

    categoryMap: { [key: number]: string } = {
        1: 'Western',
        2: 'Japanese',
        3: 'Indonesian',
        4: 'Korean',
        5: 'Middle-eastern',
        6: 'Beverages',
        7: 'Others'
    };

    constructor(
        private reviewService: ReviewService,
        private authService: AuthService
    ) { }

    ngOnChanges(): void {
        if (this.store) {
            this.loadReviews();
        }
    }

    loadReviews(): void {
        if (!this.store) return;
        this.isLoadingReviews = true;

        // Load reviews and stats
        this.reviewService.getStoreReviews(this.store.storeId).subscribe({
            next: (reviews) => {
                this.reviews = reviews;
                this.isLoadingReviews = false;
            },
            error: (err) => {
                console.error('Failed to load reviews:', err);
                this.isLoadingReviews = false;
            }
        });

        this.reviewService.getReviewStats(this.store.storeId).subscribe({
            next: (stats) => {
                this.reviewStats = stats;
            },
            error: (err) => {
                console.error('Failed to load stats:', err);
            }
        });
    }

    get averageRating(): number {
        return this.reviewStats?.averageRating || this.store?.rating || 0;
    }

    get totalReviews(): number {
        return this.reviewStats?.totalReviews || this.reviews.length;
    }

    get canAddReview(): boolean {
        return !!this.authService.getCurrentUser();
    }

    get formattedHours(): string {
        if (!this.store) return '';
        return formatTimeRange(this.store.openTime, this.store.closeTime);
    }

    get categoryName(): string {
        return this.categoryMap[Number(this.store?.category) || 7];
    }

    openAddReviewModal(): void {
        if (!this.canAddReview) {
            alert('Please login to add a review');
            return;
        }
        this.showAddReviewModal = true;
    }

    closeAddReviewModal(): void {
        this.showAddReviewModal = false;
    }

    onReviewSubmit(data: { rating: number; comment: string }): void {
        if (!this.store) return;
        this.isSubmittingReview = true;

        this.reviewService.submitReview({
            storeId: parseInt(this.store.storeId),
            score: data.rating,
            comment: data.comment
        }).subscribe({
            next: (review) => {
                // Add new review to the list
                this.reviews.unshift(review);
                this.closeAddReviewModal();
                this.isSubmittingReview = false;

                // Reload stats
                this.loadReviews();

                // Update store rating
                if (this.store && this.reviewStats) {
                    this.store.rating = this.reviewStats.averageRating;
                }

                alert('Review submitted successfully!');
            },
            error: (err) => {
                console.error('Failed to submit review:', err);
                this.isSubmittingReview = false;
                alert(err.error?.detail || 'Failed to submit review. Please try again.');
            }
        });
    }

    get statusText(): string {
        return this.store?.isOpen ? 'Open Now' : 'Closed';
    }

    get statusClass(): string {
        return this.store?.isOpen ? 'open' : 'closed';
    }

    getStarArray(rating: number): boolean[] {
        return Array(5).fill(false).map((_, index) => index < Math.round(rating));
    }

    onClose(): void {
        this.close.emit();
    }

    onGuideMe(): void {
        if (this.store) {
            this.guideMe.emit(this.store);
        }
    }

    formatDate(date: Date): string {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime()); // Units: milliseconds
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffTime < 60 * 1000) return 'Just now';
        if (diffTime < 5 * 60 * 1000) return '5 mins ago';
        if (diffTime < 30 * 60 * 1000) return '30 mins ago';
        if (diffDays < 1) return 'Today';
        if (diffDays < 2) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }
}

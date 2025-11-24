import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../models/store.model';

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: Date;
}

@Component({
    selector: 'app-store-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './store-details.component.html',
    styleUrl: './store-details.component.scss'
})
export class StoreDetailsComponent {
    @Input() store?: Store;
    @Output() close = new EventEmitter<void>();
    @Output() guideMe = new EventEmitter<Store>();

    // Mock reviews data - TODO: Replace with actual API call
    get reviews(): Review[] {
        return [
            {
                id: '1',
                userName: 'John Doe',
                rating: 5,
                comment: 'Amazing food! Highly recommended. The portions are generous and the taste is authentic.',
                date: new Date('2025-11-20')
            },
            {
                id: '2',
                userName: 'Jane Smith',
                rating: 4,
                comment: 'Good quality, fast service. Would come back again.',
                date: new Date('2025-11-18')
            },
            {
                id: '3',
                userName: 'Ahmad Rahman',
                rating: 5,
                comment: 'Best street food in the area! Fresh ingredients and friendly vendor.',
                date: new Date('2025-11-15')
            }
        ];
    }

    get averageRating(): number {
        if (this.reviews.length === 0) return 0;
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / this.reviews.length;
    }

    get totalReviews(): number {
        return this.reviews.length;
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
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }
}

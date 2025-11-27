import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-add-review-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-review-modal.component.html',
    styleUrls: ['./add-review-modal.component.scss']
})
export class AddReviewModalComponent {
    @Input() storeName: string = '';
    @Output() close = new EventEmitter<void>();
    @Output() submit = new EventEmitter<{ rating: number; comment: string }>();

    rating: number = 0;
    comment: string = '';
    isSubmitting: boolean = false;
    stars = [1, 2, 3, 4, 5];
    hoveredRating: number = 0;

    setRating(rating: number): void {
        this.rating = rating;
    }

    onMouseEnter(rating: number): void {
        this.hoveredRating = rating;
    }

    onMouseLeave(): void {
        this.hoveredRating = 0;
    }

    getStarClass(star: number): string {
        const activeRating = this.hoveredRating || this.rating;
        return star <= activeRating ? 'filled' : 'empty';
    }

    onSubmit(): void {
        if (this.rating === 0) {
            alert('Please select a rating');
            return;
        }

        if (!this.comment.trim()) {
            alert('Please write a comment');
            return;
        }

        this.isSubmitting = true;
        this.submit.emit({
            rating: this.rating,
            comment: this.comment.trim()
        });
    }

    onClose(): void {
        this.close.emit();
    }
}
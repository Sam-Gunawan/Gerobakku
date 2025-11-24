import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../models/store.model';

@Component({
    selector: 'app-store-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './store-card.component.html',
    styleUrl: './store-card.component.scss'
})
export class StoreCardComponent {
    @Input() store?: Store;
    @Input() isLoading: boolean = false;
    @Output() guideMe = new EventEmitter<Store>();

    get statusText(): string {
        return this.store?.isOpen ? 'Open' : 'Closed';
    }

    get statusClass(): string {
        return this.store?.isOpen ? 'open' : 'closed';
    }

    onGuideMe(event: Event): void {
        event.stopPropagation(); // Prevent event bubbling
        if (this.store) {
            this.guideMe.emit(this.store);
        }
    }
}

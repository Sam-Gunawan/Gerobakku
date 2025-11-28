import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../models/store.model';
import { formatTimeRange } from '../../../shared/utils/time-formatter';

@Component({
    selector: 'app-vendor-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vendor-card.component.html',
    styleUrl: './vendor-card.component.scss'
})
export class VendorCardComponent {
    @Input() store!: Store;
    @Output() cardClick = new EventEmitter<Store>();

    categories: any = [
        { id: 'western', name: 'Western', icon: '🍔' },
        { id: 'japanese', name: 'Japanese', icon: '🍱' },
        { id: 'indonesian', name: 'Indonesian', icon: '🍜' },
        { id: 'korean', name: 'Korean', icon: '🍲' },
        { id: 'middle-eastern', name: 'Middle Eastern', icon: '🥙' },
        { id: 'beverages', name: 'Beverages', icon: '🥤' }
    ];

    get statusText(): string {
        return this.store.isOpen ? 'Open' : 'Closed';
    }

    get statusClass(): string {
        return this.store.isOpen ? 'open' : 'closed';
    }

    get category(): string {
        return this.categories[Number(this.store.category) - 1].name;
    }

    get formattedHours(): string {
        return formatTimeRange(this.store.openTime, this.store.closeTime);
    }

    onClick(): void {
        this.cardClick.emit(this.store);
    }
}

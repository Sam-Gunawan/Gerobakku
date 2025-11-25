import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../models/store.model';

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

    get statusText(): string {
        return this.store.isOpen ? 'Open' : 'Closed';
    }

    get statusClass(): string {
        return this.store.isOpen ? 'open' : 'closed';
    }

    onClick(): void {
        this.cardClick.emit(this.store);
    }
}

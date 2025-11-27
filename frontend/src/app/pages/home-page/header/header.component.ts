import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileModalComponent } from '../../../shared/components/profile-modal/profile-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, ProfileModalComponent, FormsModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    @Output() searchSubmit = new EventEmitter<string>();

    showProfileModal = false;
    searchQuery = '';

    onSearchSubmit(): void {
        if (this.searchQuery.trim()) {
            this.searchSubmit.emit(this.searchQuery.trim());
        }
    }

    openProfileModal(): void {
        this.showProfileModal = true;
    }
    closeProfileModal(): void {
        this.showProfileModal = false;
    }
}
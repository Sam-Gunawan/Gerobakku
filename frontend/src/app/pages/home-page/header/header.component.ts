import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileModalComponent } from '../../../shared/components/profile-modal/profile-modal.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ProfileModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  showProfileModal = false;

  constructor(private authService: AuthService) {}

  openProfileModal(): void {
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  getInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.fullName) return 'U';
    
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.fullName[0].toUpperCase();
  }
}
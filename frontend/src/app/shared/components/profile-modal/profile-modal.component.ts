import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss']
})
export class ProfileModalComponent {
  @Output() close = new EventEmitter<void>();

  user: User | null = null;
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private authService: AuthService,
    public router: Router
  ) {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.user = this.authService.getCurrentUser();

    if (!this.user) {
      this.error = 'Unable to load user profile';
    }

    this.isLoading = false;
  }

  onChangePassword(): void {
    console.log('Change password clicked');
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.close.emit();
      this.router.navigate(['/']);
    }
  }

  getInitials(): string {
    if (!this.user?.fullName) return 'U';

    const names = this.user.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.user.fullName[0].toUpperCase();
  }

  closeModal(): void {
    this.close.emit();
  }
}

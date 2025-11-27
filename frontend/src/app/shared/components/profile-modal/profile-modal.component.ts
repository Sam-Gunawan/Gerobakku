import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { VendorService } from '../../../services/vendor.service';


@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss']
})
export class ProfileModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  user: User | null = null;
  userInitials: string = 'U';
  isLoading: boolean = true;
  error: string = '';

  hasVendorAccount: boolean = false;
  isCheckingVendor: boolean = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    private vendorService: VendorService
  ) {
    this.loadUserProfile();
  }

  ngOnInit(): void {
    this.loadUserInitials();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
        this.checkVendorStatus();
      },
      error: (err) => {
        console.error('Failed to get user:', err);
        this.isLoading = false;
        this.error = 'Unable to load user profile';
      }
    });
  }

  checkVendorStatus(): void {
    if (!this.user) return;

    this.isCheckingVendor = true;
    this.vendorService.getVendorStoreId(parseInt(this.user.userId)).subscribe({
      next: (response: any) => {
        this.hasVendorAccount = !!response.store_id;
        this.isCheckingVendor = false;
      },
      error: () => {
        this.hasVendorAccount = false;
        this.isCheckingVendor = false;
      }
    });
  }

  onVendorButtonClick(): void {
    if (this.hasVendorAccount) {
      this.router.navigate(['/vendor-dashboard']);
    } else {
      this.router.navigate(['/vendor-application']);
    }
    this.closeModal();
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

  loadUserInitials(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userInitials = this.calculateInitials(user);
      },
      error: () => {
        this.userInitials = 'U';
      }
    });
  }

  calculateInitials(user: User | null): string {
    if (!user?.fullName) return 'U';

    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.fullName[0].toUpperCase();
  }

  closeModal(): void {
    this.close.emit();
  }
}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { VendorService } from '../../../services/vendor.service';
import { InfoModalComponent } from '../info-modal/info-modal.component';


@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, InfoModalComponent],
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

  showComingSoon = false;
  showPrivacyPolicy = false;
  comingSoonTitle = 'Coming Soon';
  comingSoonContent = 'This feature is currently under development and will be available in a future update. Thank you for your patience!';
  privacyPolicyTitle = 'Privacy Policy';
  privacyPolicyContent = `
  <h3>1. Information We Collect</h3>
  <p>Gerobakku collects information you provide when registering as a user or vendor, including your name, email, phone number, and location data to provide our services.</p>
  
  <h3>2. How We Use Your Information</h3>
  <p>We use your information to:</p>
  <ul>
    <li>Provide and improve our food vendor location services</li>
    <li>Connect customers with nearby food vendors</li>
    <li>Process vendor registrations and manage vendor accounts</li>
    <li>Send notifications about nearby vendors and updates</li>
    <li>Analyze usage patterns to enhance user experience</li>
  </ul>
  
  <h3>3. Location Data</h3>
  <p>With your permission, we collect and process location data to show you nearby food vendors. You can disable location services at any time through your device settings.</p>
  
  <h3>4. Data Sharing</h3>
  <p>We do not sell your personal information. We may share data with:</p>
  <ul>
    <li>Vendors you interact with (to facilitate orders and reviews)</li>
    <li>Service providers who help us operate our platform</li>
    <li>Law enforcement when required by law</li>
  </ul>
  
  <h3>5. Data Security</h3>
  <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
  
  <h3>6. Your Rights</h3>
  <p>You have the right to access, update, or delete your personal information. Contact us at privacy@gerobakku.com for any privacy-related requests.</p>
  
  <h3>7. Cookies</h3>
  <p>We use cookies and similar technologies to improve your experience and analyze usage patterns.</p>
  
  <h3>8. Changes to Privacy Policy</h3>
  <p>We may update this policy periodically. Continued use of Gerobakku after changes constitutes acceptance of the updated policy.</p>
  
  <p><strong>Last Updated:</strong> November 2024</p>
  <p><strong>Contact:</strong> privacy@gerobakku.com</p>
`;

  openComingSoon(): void {
    this.showComingSoon = true;
  }

  openPrivacyPolicy(): void {
    this.showPrivacyPolicy = true;
  }
}

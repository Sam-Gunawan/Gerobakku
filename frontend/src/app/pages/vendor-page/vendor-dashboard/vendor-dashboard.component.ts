import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { VendorService } from '../../../services/vendor.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { TimePickerComponent } from '../../../shared/components/time-picker/time-picker.component';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { XYZ } from 'ol/source';
import { ReviewService } from '../../../services/review.service';
import { LoadingOverlayComponent } from '../../../shared/ui/loading-overlay/loading-overlay.component';
import { formatTimeRange } from '../../../shared/utils/time-formatter';
import { TokenStorageService } from '../../../services/token-storage.service';


@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent, TimePickerComponent, LoadingOverlayComponent],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit, AfterViewInit {
  // Store data
  storeId: number | null = null;
  storeName = 'Loading...';
  isOpen = false;
  openTime: string | number = '08:00';
  closeTime: string | number = '20:00';
  isHalal = false;
  rating = 0;

  // UI state
  currentTime = '';
  currentLocation = 'Loading location...';
  currentCoords: [number, number] = [106.8456, -6.2088];

  // Loading state
  isLoadingDashboard = false;

  // Review stats
  reviewStats: any = null;
  totalReviews = 0;
  recentReviewsList: any[] = [];

  // Modals
  showConfirmation = false;
  confirmationConfig = { title: '', message: '', action: '' };
  showEditHours = false;
  showEditHalal = false;
  editOpenTime = '08:00';
  editCloseTime = '20:00';
  editIsHalal = false;

  private map!: Map;
  private userMarker!: VectorLayer<VectorSource>;

  Math = Math;

  constructor(
    public router: Router,
    private authService: AuthService,
    private vendorService: VendorService,
    private reviewService: ReviewService,
    private tokenStorage: TokenStorageService
  ) { }

  ngOnInit(): void {
    if (!this.tokenStorage.isLoggedIn()) {
      console.error('No auth token found');
      alert('Please log in to access the vendor dashboard');
      this.router.navigate(['/login']);
      return;
    }

    this.updateDateTime();
    this.isLoadingDashboard = true;
    this.getCurrentLocation();
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  loadDashboardData(): void {
    this.isLoadingDashboard = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('Current user:', user); // DEBUG LOG
        // Get vendor's store ID
        this.vendorService.getVendorStoreId(parseInt(user.userId)).subscribe({
          next: (response: any) => {
            console.log('Store ID response:', response); // DEBUG LOG
            this.storeId = response.store_id;
            if (this.storeId) {
              this.fetchStoreData(this.storeId);
              this.loadRecentReviews(this.storeId);
            } else {
              console.error('No store_id in response:', response); // DEBUG LOG
              this.isLoadingDashboard = false;
              alert('You need to register as a vendor first');
              this.router.navigate(['/vendor-application']);
            }
          },
          error: (err) => {
            console.error('Failed to get store ID - Full error:', err); // DEBUG LOG
            this.isLoadingDashboard = false;
            // Better error message based on status code
            if (err.status === 404) {
              alert('You need to register as a vendor first');
              this.router.navigate(['/vendor-application']);
            } else if (err.status === 401) {
              this.tokenStorage.clear(); // Clear expired token
              alert('Your session has expired. Please log in again');
              this.router.navigate(['/login']);
            } else {
              alert(`Error loading store: ${err.error?.detail || err.message}`);
            }
          }
        });
      },
      error: (err) => {
        console.error('Failed to load user:', err); // DEBUG LOG
        this.isLoadingDashboard = false;

        // Token expired or invalid
        if (err.status === 401) {
          this.tokenStorage.clear(); // Clear expired token
          alert('Your session has expired. Please log in again');
        } else {
          alert('Authentication error. Please log in again.');
        }
        this.router.navigate(['/login']);
      }
    });
  }

  fetchStoreData(storeId: number): void {
    this.vendorService.getDashboardData(storeId).subscribe({
      next: (data) => {
        // Store data
        const store = data.store;
        this.storeName = store.name;
        this.isOpen = store.is_open;
        this.rating = store.rating;
        this.isHalal = store.is_halal;

        // Convert hours to time strings
        this.openTime = this.formatTime(store.open_time);
        this.closeTime = this.formatTime(store.close_time);

        // Review stats
        this.reviewStats = data.reviewStats.rating_distribution;
        this.totalReviews = data.reviewStats.total_reviews;

        // Update map if location available
        if (store.current_location) {
          this.currentCoords = [store.current_location.lon, store.current_location.lat];
          this.updateMapMarker();
        }

        this.isLoadingDashboard = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.isLoadingDashboard = false;
      }
    });
  }

  loadRecentReviews(storeId: number): void {
    this.reviewService.getStoreReviews(storeId).subscribe({
      next: (reviews) => {
        this.recentReviewsList = reviews;
      },
      error: (err) => {
        console.error('Failed to load recent reviews:', err);
        this.recentReviewsList = [];
      }
    });
  }

  formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  updateDateTime(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  // Toggle store status
  onToggleStore(): void {
    const action = this.isOpen ? 'close' : 'open';
    this.confirmationConfig = {
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Store`,
      message: `Are you sure you want to ${action} your store?`,
      action: action
    };
    this.showConfirmation = true;
  }

  confirmToggleStore(): void {
    if (!this.storeId) return;

    const newStatus = !this.isOpen;
    this.vendorService.updateStoreStatus(this.storeId, newStatus).subscribe({
      next: () => {
        this.isOpen = newStatus;
        this.showConfirmation = false;
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        alert('Failed to update store status');
        this.showConfirmation = false;
      }
    });
  }

  openEditHours(): void {
    // Handle both string and number formats
    if (typeof this.openTime === 'number') {
      this.editOpenTime = this.formatTimeFromMinutes(this.openTime);
      this.editCloseTime = this.formatTimeFromMinutes(this.closeTime);
    } else {
      this.editOpenTime = this.openTime;
      this.editCloseTime = this.closeTime as string;
    }
    this.showEditHours = true;
  }

  saveHours(): void {
    if (!this.storeId) return;
    // Convert HH:MM format to minutes since midnight
    const openMinutes = this.parseTimeToMinutes(this.editOpenTime);
    const closeMinutes = this.parseTimeToMinutes(this.editCloseTime);
    this.vendorService.updateStoreHours(this.storeId, openMinutes, closeMinutes).subscribe({
      next: () => {
        // Update with the new values in minutes
        this.openTime = openMinutes;
        this.closeTime = closeMinutes;
        this.showEditHours = false;
      },
      error: (err) => {
        console.error('Failed to update hours:', err);
        alert('Failed to update hours');
      }
    });
  }

  // Edit halal status
  openEditHalal(): void {
    this.editIsHalal = this.isHalal;
    this.showEditHalal = true;
  }

  saveHalal(): void {
    if (!this.storeId) return;

    this.vendorService.updateHalalStatus(this.storeId, this.editIsHalal).subscribe({
      next: () => {
        this.isHalal = this.editIsHalal;
        this.showEditHalal = false;
      },
      error: (err) => {
        console.error('Failed to update halal status:', err);
        alert('Failed to update halal status');
      }
    });
  }

  initMap(): void {
    this.userMarker = new VectorLayer({
      source: new VectorSource(),
      style: [
        new Style({
          image: new Circle({
            radius: 20,
            fill: new Fill({ color: 'rgba(251, 190, 33, 0.3)' }),
            stroke: new Stroke({ color: 'rgba(251, 190, 33, 0.5)', width: 1 })
          })
        }),
        new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({ color: '#FBBE21' }),
            stroke: new Stroke({ color: '#01161E', width: 3 })
          })
        })
      ]
    });
    this.map = new Map({
      target: 'vendor-map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          })
        }),
        this.userMarker
      ],
      view: new View({
        center: fromLonLat(this.currentCoords),
        zoom: 16
      }),
      controls: []
    });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentCoords = [position.coords.longitude, position.coords.latitude];
          this.updateMapMarker();
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }

  updateMapMarker(): void {
    if (!this.map) return;

    const feature = new Feature({
      geometry: new Point(fromLonLat(this.currentCoords))
    });
    this.userMarker.getSource()?.clear();
    this.userMarker.getSource()?.addFeature(feature);
    this.map.getView().setCenter(fromLonLat(this.currentCoords));
  }

  refreshLocation(): void {
    this.getCurrentLocation();
  }

  goBackToHome(): void {
    this.router.navigate(['/home']);
  }

  getRatingPercentage(stars: number): number {
    if (!this.totalReviews) return 0;
    const count = this.reviewStats?.[stars] || 0;
    return Math.round((count / this.totalReviews) * 100);
  }
  getRatingCount(stars: number): number {
    return this.reviewStats?.[stars] || 0;
  }
  onUpdateLocation(): void {
    this.refreshLocation();
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  get formattedHours(): string {
    return `${this.openTime} - ${this.closeTime}`;
  }

  // Convert minutes since midnight to HH:MM format
  formatTimeFromMinutes(minutes: number | string): string {
    const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Convert HH:MM format to minutes since midnight
  parseTimeToMinutes(timeString: string): number {
    const [hour, minute] = timeString.split(':').map(Number);
    return (hour * 60) + minute;
  }
}
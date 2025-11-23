import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { HeaderComponent } from '../header/header.component';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { MainSheetContentComponent } from '../main-sheet-content/main-sheet-content.component';
import { Menu1SheetContentComponent } from '../menu1-sheet-content/menu1-sheet-content.component';
import { MapComponent } from '../../../shared/components/map.component';
import { LocationService } from '../../../services/location.service';
import { LocationPoint, Store } from '../../../models/store.model';

type BottomSheetView = 'main' | 'menu-1' | 'menu-2' | 'menu-3' | 'menu-4';

@Component({
  selector: 'app-map-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    BottomSheetComponent,
    MainSheetContentComponent,
    Menu1SheetContentComponent,
    MapComponent
  ],
  templateUrl: './map-dashboard.component.html',
  styleUrl: './map-dashboard.component.scss'
})
export class MapDashboardComponent implements OnInit, OnDestroy {
  currentSheetView: BottomSheetView = 'main';

  // *** Update initial height to match BottomSheetComponent ***
  initialSheetHeight = '240px'; // *** UPDATED VALUE ***
  currentBottomSheetHeight: string = this.initialSheetHeight;
  targetIconBottomMargin: number = 15;

  private windowHeight: number = window.innerHeight;

  // Location data
  userLocation?: LocationPoint | null = null;
  vendorLocations: Store[] = [];

  // Subscriptions
  private vendorLocationsSubscription?: Subscription;

  constructor(private locationService: LocationService) { }

  ngOnInit(): void {
    this.currentBottomSheetHeight = this.initialSheetHeight;
    this.windowHeight = window.innerHeight;

    // Get user location
    this.getUserLocation();

    // Start polling for vendor locations
    this.startVendorLocationPolling();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.vendorLocationsSubscription) {
      this.vendorLocationsSubscription.unsubscribe();
    }
  }

  private async getUserLocation(): Promise<void> {
    try {
      this.userLocation = await this.locationService.getUserLocation();
      console.log('User location obtained:', this.userLocation);
    } catch (error) {
      console.error('Failed to get user location:', error);
      // Don't set user location if permission denied
      this.userLocation = null;
    }
  }

  private startVendorLocationPolling(): void {
    // Initialize polling
    this.locationService.initializeStores();

    // Subscribe to vendor location updates
    this.vendorLocationsSubscription = this.locationService.vendorLocations$.subscribe(
      stores => {
        this.vendorLocations = stores;
        console.log(`Updated vendor locations: ${stores.length} stores`);
      }
    );
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.windowHeight = window.innerHeight;
  }

  onBottomSheetHeightChange(newHeight: string): void {
    this.currentBottomSheetHeight = newHeight;
  }

  handleViewChange(requestedView: string): void {
    if (['main', 'menu-1', 'menu-2', 'menu-3', 'menu-4'].includes(requestedView)) {
      this.currentSheetView = requestedView as BottomSheetView;
      console.log('Switching bottom sheet view to:', this.currentSheetView);
    } else {
      console.warn('Unknown view requested:', requestedView);
    }
  }

  getTargetIconBottom(): string {
    let heightValuePx = 0;
    const sheetHeight = this.currentBottomSheetHeight;

    if (sheetHeight.endsWith('px')) {
      heightValuePx = parseInt(sheetHeight, 10);
    } else if (sheetHeight.endsWith('vh')) {
      const vh = parseInt(sheetHeight, 10);
      heightValuePx = (vh / 100) * this.windowHeight;
    } else {
      const parsed = parseInt(sheetHeight, 10);
      // Use the updated initial height as fallback
      heightValuePx = !isNaN(parsed) ? parsed : 240; // *** UPDATED FALLBACK ***
    }
    return `${Math.max(0, heightValuePx) + this.targetIconBottomMargin}px`;
  }
}
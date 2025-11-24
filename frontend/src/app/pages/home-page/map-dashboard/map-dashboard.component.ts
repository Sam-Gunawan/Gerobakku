import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { MainSheetContentComponent } from '../main-sheet-content/main-sheet-content.component';
import { Menu1SheetContentComponent } from '../menu1-sheet-content/menu1-sheet-content.component';
import { MapComponent } from '../../../shared/components/map.component';
import { StoreCardComponent } from '../../../shared/components/store-card/store-card.component';
import { StoreDetailsComponent } from '../../../shared/components/store-details/store-details.component';
import { LocationService } from '../../../services/location.service';
import { RoutingService } from '../../../services/routing.service';
import { LocationPoint, Store } from '../../../models/store.model';

@Component({
  selector: 'app-map-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    BottomSheetComponent,
    MainSheetContentComponent,
    Menu1SheetContentComponent,
    MapComponent,
    StoreCardComponent,
    StoreDetailsComponent
  ],
  templateUrl: './map-dashboard.component.html',
  styleUrl: './map-dashboard.component.scss'
})

export class MapDashboardComponent implements OnInit, OnDestroy {
  // Sheet state - SIMPLIFIED
  showStoreDetails = false;
  selectedStore: Store | null = null;
  initialSheetHeight = '240px';
  currentBottomSheetHeight: string = this.initialSheetHeight;
  targetIconBottomMargin: number = 15;
  private windowHeight: number = window.innerHeight;

  // Location data
  userLocation?: LocationPoint | null = null;
  vendorLocations: Store[] = [];

  // Pin interaction (for map)
  @ViewChild(MapComponent) mapComponent?: MapComponent;

  // Subscriptions
  private vendorLocationsSubscription?: Subscription;
  constructor(
    private locationService: LocationService,
    private routingService: RoutingService
  ) { }

  ngOnInit(): void {
    this.currentBottomSheetHeight = this.initialSheetHeight;
    this.windowHeight = window.innerHeight;
    this.getUserLocation();
    this.startVendorLocationPolling();
  }

  ngOnDestroy(): void {
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
      this.userLocation = null;
    }
  }

  private startVendorLocationPolling(): void {
    this.locationService.initializeStores();
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
      heightValuePx = !isNaN(parsed) ? parsed : 240;
    }

    return `${Math.max(0, heightValuePx) + this.targetIconBottomMargin}px`;
  }

  onVendorCardClick(store: Store): void {
    console.log('Vendor card clicked:', store.name);
    this.selectedStore = store;
    this.showStoreDetails = true;
  }

  onCloseStoreDetails(): void {
    this.showStoreDetails = false;
    this.selectedStore = null;
  }

  onGuideMe(store: Store): void {
    if (!this.userLocation) {
      console.warn('User location not available for routing');
      alert('Please enable location services to get directions');
      return;
    }

    if (!store.currentLocation) {
      console.warn('Store location not available');
      return;
    }

    console.log(`Getting route to ${store.name}...`);

    this.routingService.getRoute(this.userLocation, store.currentLocation).subscribe(
      routeData => {
        if (routeData && this.mapComponent) {
          this.mapComponent.displayRoute(routeData.coordinates);
          console.log(`Route displayed: ${this.routingService.formatDistance(routeData.distance)}, ${this.routingService.formatDuration(routeData.duration)}`);
        } else {
          console.error('Failed to get route');
          alert('Could not calculate route. Please try again.');
        }
      }
    );
  }
}
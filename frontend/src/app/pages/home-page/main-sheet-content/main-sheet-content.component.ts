import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorCardComponent } from '../vendor-card/vendor-card.component';
import { LocationPoint, Store } from '../../../models/store.model';
import { LocationService } from '../../../services/location.service';


@Component({
  selector: 'app-main-sheet-content',
  standalone: true,
  imports: [CommonModule, VendorCardComponent],
  templateUrl: './main-sheet-content.component.html',
  styleUrl: './main-sheet-content.component.scss'
})
export class MainSheetContentComponent implements OnInit, OnDestroy {
  @Output() vendorCardClick = new EventEmitter<Store>();

  // Carousel state
  carouselImages = [
    'assets/ad1.png',
    'assets/ad2.png',
    'assets/ad3.png',
    'assets/ad4.png',
    'assets/ad5.png',
  ];
  currentCarouselIndex = 0;
  private carouselInterval: any;

  // Categories with SVG-like icons (using emojis as placeholder)
  categories: any = [
    { id: 'western', name: 'Western', icon: '🍔' },
    { id: 'japanese', name: 'Japanese', icon: '🍱' },
    { id: 'indonesian', name: 'Indonesian', icon: '🍜' },
    { id: 'korean', name: 'Korean', icon: '🍲' },
    { id: 'middle-eastern', name: 'Middle Eastern', icon: '🥙' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' }
  ];

  isSimulationRunning: boolean = false;

  // // Mock data for Near You
  // nearYouStores: Store[] = [
  //   {
  //     storeId: '1',
  //     vendorId: '1',
  //     name: 'Sate Pak Haji',
  //     description: 'Authentic Indonesian satay',
  //     rating: 4.8,
  //     category: 'Indonesian',
  //     address: 'Jl. Sudirman No. 123',
  //     isOpen: true,
  //     isHalal: true,
  //     openTime: '10:00',
  //     closeTime: '22:00',
  //     storeImageUrl: 'assets/ad1.png', // Placeholder
  //     menu: []
  //   },
  //   {
  //     storeId: '2',
  //     vendorId: '2',
  //     name: 'Ramen Ichiban',
  //     description: 'Japanese ramen house',
  //     rating: 4.6,
  //     category: 'Japanese',
  //     address: 'Jl. Thamrin No. 456',
  //     isOpen: true,
  //     isHalal: false,
  //     openTime: '11:00',
  //     closeTime: '23:00',
  //     storeImageUrl: 'assets/ad2.png', // Placeholder
  //     menu: []
  //   }
  // ];

  // // Mock data for Stalls You May Like
  // recommendedStores: Store[] = [
  //   {
  //     storeId: '3',
  //     vendorId: '3',
  //     name: 'Burger House',
  //     description: 'Gourmet burgers and fries',
  //     rating: 4.5,
  //     category: 'Western',
  //     address: 'Jl. Gatot Subroto No. 789',
  //     isOpen: false,
  //     isHalal: false,
  //     openTime: '12:00',
  //     closeTime: '21:00',
  //     storeImageUrl: 'assets/ad3.png', // Placeholder
  //     menu: []
  //   },
  //   {
  //     storeId: '4',
  //     vendorId: '4',
  //     name: 'Kimchi Paradise',
  //     description: 'Korean street food',
  //     rating: 4.7,
  //     category: 'Korean',
  //     address: 'Jl. Rasuna Said No. 321',
  //     isOpen: true,
  //     isHalal: true,
  //     openTime: '09:00',
  //     closeTime: '20:00',
  //     storeImageUrl: 'assets/ad1.png', // Placeholder
  //     menu: []
  //   }
  // ];

  nearYouStores: Store[] = [];
  recommendedStores: Store[] = [];
  userLocation: LocationPoint | null = null;

  showSearchResults = false;
  searchQuery = '';
  selectedCategory: string | null = null;
  selectedCategoryName = '';
  showingNearYou = false;
  searchResults: Store[] = [];
  displayedResults: Store[] = [];
  allStores: Store[] = [];
  resultsPerPage = 5;
  currentPage = 1;

  constructor(private locationService: LocationService, private router: Router) { }

  ngOnInit(): void {
    // Auto-rotate carousel every 3 seconds
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
    this.loadUserLocationAndStores();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  async loadUserLocationAndStores(): Promise<void> {
    try {
      // Get user location
      this.userLocation = await this.locationService.getUserLocation();
      console.log('User location:', this.userLocation);
    } catch (error) {
      console.error('Failed to get user location:', error);
      // Use default location if geolocation fails (Sampoerna University)
      this.userLocation = { lat: -6.2088, lon: 106.8456 };
    }

    // Load all stores from backend
    this.locationService.getVendorLocations().subscribe({
      next: (stores) => {
        console.log('Loaded stores:', stores);
        this.processStores(stores);
      },
      error: (error) => {
        console.error('Failed to load stores:', error);
      }
    });
  }

  processStores(stores: Store[]): void {
    if (!this.userLocation) return;

    // Stores all stores
    this.allStores = stores;

    // Filter stores with locations
    const storesWithLocation = stores.filter(s => s.currentLocation);

    // Calculate distances for all stores
    const storesWithDistance = storesWithLocation.map(store => ({
      store,
      distance: this.calculateDistance(
        this.userLocation!.lat,
        this.userLocation!.lon,
        store.currentLocation!.lat,
        store.currentLocation!.lon
      )
    }));

    // Sort by distance
    storesWithDistance.sort((a, b) => a.distance - b.distance);

    // Near You: Take closest 2 stores
    this.nearYouStores = storesWithDistance.slice(0, 2).map(s => s.store);

    // Stalls You May Like: Random selection of 4 stores (excluding the nearest 2)
    const remainingStores = storesWithDistance.slice(2).map(s => s.store);
    this.recommendedStores = this.getRandomStores(remainingStores, 4);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula to calculate distance in kilometers
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  getRandomStores(stores: Store[], count: number): Store[] {
    // Shuffle array and take first 'count' items
    const shuffled = [...stores].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  nextSlide(): void {
    this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselImages.length;
  }

  previousSlide(): void {
    this.currentCarouselIndex = (this.currentCarouselIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  goToSlide(index: number): void {
    this.currentCarouselIndex = index;
  }

  onCategoryClick(categoryId: string, categoryName: string): void {
    this.selectedCategory = categoryId;
    this.selectedCategoryName = categoryName;
    this.showingNearYou = false;
    this.searchQuery = '';
    // Filter stores by category (category_id maps to numbers 1-6)
    const categoryMap: { [key: string]: number } = {
      'western': 1,
      'japanese': 2,
      'indonesian': 3,
      'korean': 4,
      'middle-eastern': 5,
      'beverages': 6,
    };

    const categoryNum = categoryMap[categoryId];
    let filtered = this.allStores.filter(s =>
      parseInt(s.category) === categoryNum
    );

    // Sort by distance if we have user location
    if (this.userLocation) {
      filtered = this.sortByDistance(filtered);
    }
    this.searchResults = filtered;
    this.currentPage = 1;
    this.displayedResults = this.searchResults.slice(0, this.resultsPerPage);
    this.showSearchResults = true;
  }

  onSeeAllNearYou(): void {
    this.showingNearYou = true;
    this.selectedCategory = null;
    this.searchQuery = '';

    // Get all stores sorted by distance
    const sorted = this.sortByDistance(this.allStores.filter(s => s.currentLocation));

    this.searchResults = sorted;
    this.currentPage = 1;
    this.displayedResults = this.searchResults.slice(0, this.resultsPerPage);
    this.showSearchResults = true;
  }

  // Search method (called from header component)
  performSearch(query: string): void {
    this.searchQuery = query;
    this.selectedCategory = null;
    this.showingNearYou = false;

    // Search in name, description, and address
    const filtered = this.allStores.filter(store =>
      store.name.toLowerCase().includes(query.toLowerCase()) ||
      store.description.toLowerCase().includes(query.toLowerCase()) ||
      store.address.toLowerCase().includes(query.toLowerCase())
    );

    // Sort by distance
    this.searchResults = this.sortByDistance(filtered);
    this.currentPage = 1;
    this.displayedResults = this.searchResults.slice(0, this.resultsPerPage);
    this.showSearchResults = true;
  }

  clearSearch(): void {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.selectedCategory = null;
    this.showingNearYou = false;
    this.searchResults = [];
    this.displayedResults = [];
    this.currentPage = 1;
  }

  loadMore(): void {
    this.currentPage++;
    const endIndex = this.currentPage * this.resultsPerPage;
    this.displayedResults = this.searchResults.slice(0, endIndex);
  }

  sortByDistance(stores: Store[]): Store[] {
    if (!this.userLocation) return stores;
    const storesWithDistance = stores
      .filter(s => s.currentLocation)
      .map(store => ({
        store,
        distance: this.calculateDistance(
          this.userLocation!.lat,
          this.userLocation!.lon,
          store.currentLocation!.lat,
          store.currentLocation!.lon
        )
      }));
    storesWithDistance.sort((a, b) => a.distance - b.distance);
    return storesWithDistance.map(s => s.store);
  }

  onStartSimulation(): void {
    if (this.isSimulationRunning) return;

    this.isSimulationRunning = true;
    this.locationService.startSimulation().subscribe({
      next: (response) => {
        console.log('🎬 Simulation started:', response);
      },
      error: (error) => {
        console.error('❌ Simulation error:', error);
        this.isSimulationRunning = false;
      }
    });
  }

  onVendorCardClick(store: Store): void {
    console.log('Vendor card clicked:', store.name);
    this.vendorCardClick.emit(store);  // Emit Store directly instead of string
  }

  goToVendorDashboard(): void {
    this.router.navigate(['/vendor-dashboard']);
  }

  get hasMoreResults(): boolean {
    return this.displayedResults.length < this.searchResults.length;
  }

}
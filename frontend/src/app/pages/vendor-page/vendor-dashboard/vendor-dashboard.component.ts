import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle, Fill, Stroke } from 'ol/style';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit, AfterViewInit {
  isOpen: boolean = false;
  currentLocation: string = 'Loading location...';
  storeName: string = 'My Store';
  currentTime: string = '';
  currentDate: string = '';
  
  private map!: Map;
  private userMarker!: VectorLayer<VectorSource>;
  currentCoords: [number, number] = [106.8456, -6.2088]; // Default to Jakarta
  
  // Mock review data
  reviewStats = {
    5: 89,
    4: 42,
    3: 15,
    2: 7,
    1: 3
  };

  // Mock sales data for graph
  salesData = [
    { day: 'Mon', value: 45, percentage: 75 },
    { day: 'Tue', value: 32, percentage: 53 },
    { day: 'Wed', value: 58, percentage: 97 },
    { day: 'Thu', value: 28, percentage: 47 },
    { day: 'Fri', value: 52, percentage: 87 },
    { day: 'Sat', value: 60, percentage: 100 },
    { day: 'Sun', value: 38, percentage: 63 }
  ];

  // Mock recent reviews
  recentReviews = [
    { name: 'John Doe', rating: 5, comment: 'Amazing food! The satay was perfectly grilled and the peanut sauce was incredible.', time: '2h ago' },
    { name: 'Sarah Smith', rating: 4, comment: 'Great taste but had to wait a bit. Still worth it though!', time: '5h ago' },
    { name: 'Mike Chen', rating: 5, comment: 'Best street food in town. Always fresh and delicious. Highly recommend!', time: '1d ago' },
    { name: 'Lisa Wong', rating: 5, comment: 'Love this place! The owner is so friendly and the portions are generous.', time: '2d ago' }
  ];

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateDateTime();
    this.loadStoreInfo();
    // Update time every 10 milliseconds for smooth millisecond display
    setInterval(() => this.updateDateTime(), 10);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.getCurrentLocation();
  }

  updateDateTime(): void {
    const now = new Date();
    
    // Format time with seconds and milliseconds (Indonesia, GMT+7)
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    
    this.currentTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    
    // Format date (Day, Month Date, Year) with timezone
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' (Indonesia, GMT+7)';
  }

  loadStoreInfo(): void {
    // TODO: Load actual store info from API
    const user = this.authService.getCurrentUser();
    if (user) {
      this.storeName = user.fullName + "'s Store";
    }
    
    // TODO: Get actual location from GPS
    this.getCurrentLocation();
  }

  initMap(): void {
    // Create marker layer with pulsing animation
    this.userMarker = new VectorLayer({
      source: new VectorSource(),
      style: (feature) => {
        return [
          // Outer pulse circle (larger, fading)
          new Style({
            image: new Circle({
              radius: 20,
              fill: new Fill({ color: 'rgba(251, 190, 33, 0.3)' }),
              stroke: new Stroke({ color: 'rgba(251, 190, 33, 0.5)', width: 1 })
            })
          }),
          // Middle pulse circle
          new Style({
            image: new Circle({
              radius: 15,
              fill: new Fill({ color: 'rgba(251, 190, 33, 0.5)' }),
              stroke: new Stroke({ color: 'rgba(251, 190, 33, 0.7)', width: 1 })
            })
          }),
          // Main marker
          new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({ color: '#FBBE21' }),
              stroke: new Stroke({ color: '#01161E', width: 3 })
            })
          })
        ];
      }
    });

    // Initialize map
    this.map = new Map({
      target: 'vendor-map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.userMarker
      ],
      view: new View({
        center: fromLonLat(this.currentCoords),
        zoom: 15
      })
    });

    // Start animation
    this.startPulseAnimation();
  }

  startPulseAnimation(): void {
    let frame = 0;
    const animate = () => {
      frame++;
      const source = this.userMarker.getSource();
      if (source) {
        source.changed(); // Trigger re-render
      }
      requestAnimationFrame(animate);
    };
    animate();

    // Update style with animation
    this.userMarker.setStyle((feature) => {
      const now = Date.now();
      const phase1 = (now % 3000) / 3000; // First ring: 3 second cycle
      const phase2 = ((now - 400) % 3000) / 3000; // Second ring: 400ms delay
      
      // Easing function for smoother fade out
      const easeOut1 = 1 - Math.pow(phase1, 2);
      const easeOut2 = 1 - Math.pow(phase2, 2);
      
      const styles = [
        // Main marker (always visible)
        new Style({
          image: new Circle({
            radius: 12,
            fill: new Fill({ color: '#FBBE21' }),
            stroke: new Stroke({ color: '#01161E', width: 3 })
          })
        })
      ];

      // First pulse ring (outer)
      if (phase1 >= 0) {
        styles.unshift(
          new Style({
            image: new Circle({
              radius: 15 + (phase1 * 60), // Grows from 15 to 75
              fill: new Fill({ 
                color: 'transparent'
              }),
              stroke: new Stroke({ 
                color: `rgba(1, 22, 30, ${0.8 * easeOut1})`,
                width: Math.max(5 * easeOut1, 0.5)
              })
            })
          })
        );
      }

      // Second pulse ring (middle) - starts 400ms later
      if (phase2 >= 0 && phase2 <= 1) {
        styles.unshift(
          new Style({
            image: new Circle({
              radius: 15 + (phase2 * 40),
              fill: new Fill({ 
                color: 'transparent'
              }),
              stroke: new Stroke({ 
                color: `rgba(1, 22, 30, ${0.9 * Math.pow(easeOut2, 0.8)})`,
                width: Math.max(4 * easeOut2, 0.5)
              })
            })
          })
        );
      }

      return styles;
    });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          this.currentCoords = [lon, lat];
          this.currentLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          
          // Update map center and marker
          this.updateMapLocation(lon, lat);
        },
        (error) => {
          this.currentLocation = 'Location not available';
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      this.currentLocation = 'Geolocation not supported';
    }
  }

  updateMapLocation(lon: number, lat: number): void {
    if (!this.map) return;

    const coords = fromLonLat([lon, lat]);
    
    // Update map center
    this.map.getView().setCenter(coords);
    
    // Clear existing markers
    const source = this.userMarker.getSource();
    if (source) {
      source.clear();
      
      // Add new marker
      const marker = new Feature({
        geometry: new Point(coords)
      });
      source.addFeature(marker);
    }
  }

  toggleStoreStatus(): void {
    this.isOpen = !this.isOpen;
    // TODO: Update store status in backend
    console.log('Store status changed to:', this.isOpen ? 'Open' : 'Closed');
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }

  onUpdateLocation(): void {
    this.currentLocation = 'Updating...';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          this.currentCoords = [lon, lat];
          this.currentLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          this.updateMapLocation(lon, lat);
        },
        (error) => {
          this.currentLocation = 'Location update failed';
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }

  getRatingCount(stars: number): number {
    return this.reviewStats[stars as keyof typeof this.reviewStats] || 0;
  }

  getRatingPercentage(stars: number): number {
    const total = Object.values(this.reviewStats).reduce((sum, count) => sum + count, 0);
    const count = this.getRatingCount(stars);
    return total > 0 ? (count / total) * 100 : 0;
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }
}

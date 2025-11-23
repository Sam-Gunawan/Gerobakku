import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorCardComponent } from '../vendor-card/vendor-card.component';
import { Store } from '../../../models/store.model';

interface Category {
  id: string;
  name: string;
  icon: string; // Will use emoji for now, can be replaced with SVG
}

@Component({
  selector: 'app-main-sheet-content',
  standalone: true,
  imports: [CommonModule, VendorCardComponent],
  templateUrl: './main-sheet-content.component.html',
  styleUrl: './main-sheet-content.component.scss'
})
export class MainSheetContentComponent implements OnInit, OnDestroy {
  @Output() viewChangeRequest = new EventEmitter<string>();

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
  categories: Category[] = [
    { id: 'favorites', name: 'Favorites', icon: '⭐' },
    { id: 'western', name: 'Western', icon: '🍔' },
    { id: 'japanese', name: 'Japanese', icon: '🍱' },
    { id: 'indonesian', name: 'Indonesian', icon: '🍜' },
    { id: 'korean', name: 'Korean', icon: '🍲' },
    { id: 'middle-eastern', name: 'Middle Eastern', icon: '🥙' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' }
  ];

  // Mock data for Near You
  nearYouStores: Store[] = [
    {
      storeId: '1',
      vendorId: '1',
      name: 'Sate Pak Haji',
      description: 'Authentic Indonesian satay',
      rating: 4.8,
      category: 'Indonesian',
      address: 'Jl. Sudirman No. 123',
      isOpen: true,
      isHalal: true,
      openTime: '10:00',
      closeTime: '22:00',
      storeImageUrl: 'assets/ad1.png', // Placeholder
      menu: []
    },
    {
      storeId: '2',
      vendorId: '2',
      name: 'Ramen Ichiban',
      description: 'Japanese ramen house',
      rating: 4.6,
      category: 'Japanese',
      address: 'Jl. Thamrin No. 456',
      isOpen: true,
      isHalal: false,
      openTime: '11:00',
      closeTime: '23:00',
      storeImageUrl: 'assets/ad2.png', // Placeholder
      menu: []
    }
  ];

  // Mock data for Stalls You May Like
  recommendedStores: Store[] = [
    {
      storeId: '3',
      vendorId: '3',
      name: 'Burger House',
      description: 'Gourmet burgers and fries',
      rating: 4.5,
      category: 'Western',
      address: 'Jl. Gatot Subroto No. 789',
      isOpen: false,
      isHalal: false,
      openTime: '12:00',
      closeTime: '21:00',
      storeImageUrl: 'assets/ad3.png', // Placeholder
      menu: []
    },
    {
      storeId: '4',
      vendorId: '4',
      name: 'Kimchi Paradise',
      description: 'Korean street food',
      rating: 4.7,
      category: 'Korean',
      address: 'Jl. Rasuna Said No. 321',
      isOpen: true,
      isHalal: true,
      openTime: '09:00',
      closeTime: '20:00',
      storeImageUrl: 'assets/ad1.png', // Placeholder
      menu: []
    }
  ];

  ngOnInit(): void {
    // Auto-rotate carousel every 3 seconds
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
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

  onCategoryClick(categoryId: string): void {
    console.log('Category clicked:', categoryId);
    // TODO: Implement category filtering
  }

  onSeeAllNearYou(): void {
    console.log('See all near you clicked');
    // TODO: Navigate to full list
  }

  onSeeAllRecommended(): void {
    console.log('See all recommended clicked');
    // TODO: Navigate to full list
  }
}
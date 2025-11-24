import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-sheet-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-sheet-content.component.html',
  styleUrl: './main-sheet-content.component.scss'
})
export class MainSheetContentComponent implements OnInit, OnDestroy {
  // Output event to tell the parent (MapDashboard) to switch view
  @Output() viewChangeRequest = new EventEmitter<string>();

  constructor(private router: Router) {}

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

  // Placeholder function for button clicks
  navigateTo(menuName: string): void {
    console.log(`Maps to: ${menuName}`);
    // Emit event to parent to handle the actual view switch
    this.viewChangeRequest.emit(menuName);
  }

  goToVendorDashboard(): void {
    this.router.navigate(['/vendor-dashboard']);
  }
}
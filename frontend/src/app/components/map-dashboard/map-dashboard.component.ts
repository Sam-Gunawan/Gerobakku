import { Component, OnInit, HostListener } from '@angular/core'; // Added HostListener
import { HeaderComponent } from '../header/header.component';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BottomSheetComponent],
  templateUrl: './map-dashboard.component.html',
  styleUrl: './map-dashboard.component.scss'
})
export class MapDashboardComponent implements OnInit {
  // *** Update initial height to match BottomSheetComponent ***
  initialSheetHeight = '230px'; // *** UPDATED VALUE ***
  currentBottomSheetHeight: string = this.initialSheetHeight;
  targetIconBottomMargin: number = 15; // Slightly reduce margin

  // Track window height for vh calculation
  private windowHeight: number = window.innerHeight;

  ngOnInit(): void {
    this.currentBottomSheetHeight = this.initialSheetHeight;
    this.windowHeight = window.innerHeight; // Store initial height
  }

  // Update window height on resize for accurate vh calculations
  @HostListener('window:resize')
  onWindowResize(): void {
    this.windowHeight = window.innerHeight;
    // No need to trigger target icon update directly, getTargetIconBottom recalculates
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
      // Use the tracked window height for consistency
      heightValuePx = (vh / 100) * this.windowHeight;
    } else {
      const parsed = parseInt(sheetHeight, 10);
      // Use the updated initial height as fallback
      heightValuePx = !isNaN(parsed) ? parsed : 230; // *** UPDATED FALLBACK ***
    }

    // Ensure icon doesn't go below screen
    return `${Math.max(0, heightValuePx) + this.targetIconBottomMargin}px`;
  }
}
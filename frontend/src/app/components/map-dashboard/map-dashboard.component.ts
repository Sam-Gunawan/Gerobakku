import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../header/header.component';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { MainSheetContentComponent } from '../main-sheet-content/main-sheet-content.component';
import { Menu1SheetContentComponent } from '../menu1-sheet-content/menu1-sheet-content.component';

type BottomSheetView = 'main' | 'menu-1' | 'menu-2' | 'menu-3' | 'menu-4';

@Component({
  selector: 'app-map-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    BottomSheetComponent,
    MainSheetContentComponent,
    Menu1SheetContentComponent
  ],
  templateUrl: './map-dashboard.component.html',
  styleUrl: './map-dashboard.component.scss'
})
export class MapDashboardComponent implements OnInit {
  currentSheetView: BottomSheetView = 'main';

  // *** Update initial height to match BottomSheetComponent ***
  initialSheetHeight = '240px'; // *** UPDATED VALUE ***
  currentBottomSheetHeight: string = this.initialSheetHeight;
  targetIconBottomMargin: number = 15;

  private windowHeight: number = window.innerHeight;

  ngOnInit(): void {
    this.currentBottomSheetHeight = this.initialSheetHeight;
    this.windowHeight = window.innerHeight;
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
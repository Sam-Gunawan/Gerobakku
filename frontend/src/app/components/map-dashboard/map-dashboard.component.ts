import { Component, OnInit } from '@angular/core';
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
  // Update initial height to match BottomSheetComponent's new 'initial' value
  initialSheetHeight = '265px'; // *** UPDATED VALUE ***
  currentBottomSheetHeight: string = this.initialSheetHeight;
  targetIconBottomMargin: number = 20;

  ngOnInit(): void {
    this.currentBottomSheetHeight = this.initialSheetHeight;
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
      heightValuePx = (vh / 100) * window.innerHeight;
    } else {
      const parsed = parseInt(sheetHeight, 10);
      heightValuePx = !isNaN(parsed) ? parsed : 265; // Fallback to new initial height
    }

    return `${Math.max(0, heightValuePx) + this.targetIconBottomMargin}px`;
  }
}
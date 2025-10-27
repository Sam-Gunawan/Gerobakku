import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-main-sheet-content',
  standalone: true,
  imports: [],
  templateUrl: './main-sheet-content.component.html',
  styleUrl: './main-sheet-content.component.scss'
})
export class MainSheetContentComponent {
  // Output event to tell the parent (MapDashboard) to switch view
  @Output() viewChangeRequest = new EventEmitter<string>();

  // Placeholder function for button clicks
  navigateTo(menuName: string): void {
    console.log(`Maps to: ${menuName}`);
    // Emit event to parent to handle the actual view switch
    this.viewChangeRequest.emit(menuName);
  }
}
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor
import { VendorListItemComponent } from '../vendor-list-item/vendor-list-item.component'; // Import the child component

@Component({
  selector: 'app-menu1-sheet-content',
  standalone: true,
  imports: [CommonModule, VendorListItemComponent], // Import necessary modules/components
  templateUrl: './menu1-sheet-content.component.html',
  styleUrl: './menu1-sheet-content.component.scss'
})
export class Menu1SheetContentComponent {
  // Output event to tell parent (MapDashboard) to go back
  @Output() viewChangeRequest = new EventEmitter<string>();

  // Placeholder data - replace with API data later
  vendors = [
    { id: 1, name: 'Vendor A Placeholder', rating: '4.5', distance: '100m' },
    { id: 2, name: 'Vendor B Placeholder', rating: '4.0', distance: '250m' },
    { id: 3, name: 'Vendor C Placeholder', rating: '4.8', distance: '500m' },
    { id: 4, name: 'Vendor D Placeholder', rating: '4.2', distance: '1km' }
  ];

  // Function to handle the back button click
  goBack(): void {
    // Emit an event to request changing back to the 'main' view
    this.viewChangeRequest.emit('main'); // 'main' is an identifier for the main sheet content
  }
}
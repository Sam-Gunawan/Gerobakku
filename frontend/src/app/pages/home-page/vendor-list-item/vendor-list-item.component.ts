import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf etc. if used

@Component({
  selector: 'app-vendor-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-list-item.component.html',
  styleUrl: './vendor-list-item.component.scss'
})
export class VendorListItemComponent {
  // Input property to receive data later from the parent (Menu1SheetContentComponent)
  // For now, we'll just use placeholders in the template.
  @Input() vendorData: any = null; // Replace 'any' with a specific interface later

  constructor() {}
}
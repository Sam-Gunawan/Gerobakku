import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand-lockup',
  imports: [],
  templateUrl: './brand-lockup.component.html',
  styleUrl: './brand-lockup.component.scss'
})
export class BrandLockupComponent {
  @Input() name = 'Gerobakku';
  @Input() tagline = 'Cari. Cek. Cuss.';
  @Input() logo = 'GB';
  @Input() orientation: 'row' | 'column' = 'row';
  @Input() muted = false;
}

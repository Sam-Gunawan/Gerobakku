import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-hero',
  imports: [],
  templateUrl: './auth-hero.component.html',
  styleUrl: './auth-hero.component.scss'
})
export class AuthHeroComponent {
  @Input() title = 'Find trusted carts nearby';
  @Input() description = 'Live locations, peer reviews, and chat with vendors.';
}

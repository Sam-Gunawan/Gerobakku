import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  readonly heroStats = [
    { label: 'Cities', value: '32+' },
    { label: 'Local carts', value: '1,200+' },
    { label: 'Happy foodies', value: '58k' }
  ];
}

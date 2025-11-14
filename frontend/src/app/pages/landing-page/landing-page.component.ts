import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrandLockupComponent } from '../../shared/ui/brand-lockup/brand-lockup.component';
import { CtaButtonComponent } from '../../shared/ui/cta-button/cta-button.component';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule, BrandLockupComponent, CtaButtonComponent],
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

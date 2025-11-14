import { Component } from '@angular/core';
import { BrandLockupComponent } from '../brand-lockup/brand-lockup.component';

@Component({
  selector: 'app-auth-layout',
  imports: [BrandLockupComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
}

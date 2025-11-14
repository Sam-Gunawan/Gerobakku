import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-cta-button',
  imports: [RouterModule, NgIf],
  templateUrl: './cta-button.component.html',
  styleUrl: './cta-button.component.scss'
})
export class CtaButtonComponent {
  @Input() label = 'Get Started';
  @Input() routerLink?: string | any[];
  @Input() href?: string;
  @Input() fullWidth = true;
  @Input() variant: 'primary' | 'ghost' = 'primary';

  get classes(): Record<string, boolean> {
    return {
      'cta-button--ghost': this.variant === 'ghost',
      'cta-button--full': this.fullWidth
    };
  }
}

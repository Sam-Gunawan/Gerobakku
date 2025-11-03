import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss'
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' = 'text';
  @Input() placeholder = '';
  @Input() control: FormControl | null = null;
  @Input() errorMessage = 'This field is required';
  @Input() autocomplete = '';

  get showError(): boolean {
    return !!(this.control?.invalid && this.control?.touched);
  }

  get isInvalid(): boolean {
    return this.showError;
  }
}

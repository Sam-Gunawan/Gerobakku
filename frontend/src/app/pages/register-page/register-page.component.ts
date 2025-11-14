import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthLayoutComponent } from '../../shared/ui/auth-layout/auth-layout.component';
import { AuthHeroComponent } from '../../shared/ui/auth-hero/auth-hero.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthLayoutComponent, AuthHeroComponent, FormFieldComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  loading = false;
  errorMsg = '';
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    const { fullName, email, password } = this.form.value;

    this.auth.register({
      full_name: fullName ?? '',
      email: email ?? '',
      password: password ?? '',
    }).subscribe({
      next: () => {
        // Navigate to home page on successful registration
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMsg = err?.error?.detail || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  get fullNameCtrl(): FormControl {
    return this.form.get('fullName') as FormControl;
  }
  
  get emailCtrl(): FormControl {
    return this.form.get('email') as FormControl;
  }
  
  get passwordCtrl(): FormControl {
    return this.form.get('password') as FormControl;
  }
}

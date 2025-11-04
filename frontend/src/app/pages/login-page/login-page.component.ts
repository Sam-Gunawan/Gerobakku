import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthLayoutComponent } from '../../shared/ui/auth-layout/auth-layout.component';
import { AuthHeroComponent } from '../../shared/ui/auth-hero/auth-hero.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthLayoutComponent, AuthHeroComponent, FormFieldComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  loading = false;
  errorMsg = '';
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    // If the form is invalid or already loading, do nothing
    if (this.form.invalid || this.loading) return;

    // Clear error message and set loading state
    this.loading = true;
    this.errorMsg = '';

    const { email, password } = this.form.value;

    this.auth.login({
      email: email ?? '',
      password: password ?? '',
    }).subscribe({
      next: () => {
        // Navigate to home page on successful login
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMsg = err?.error?.detail || 'Login failed. Please try again.';
        this.loading = false;
      }
    });

  }

  get showAuthNotice(): boolean {
    return this.route.snapshot.queryParams['fromUrl'] != null;
  }


  // Convenience getters for easy access to form fields
  get emailCtrl(): FormControl {
    return this.form.get('email') as FormControl;
  }
  
  get passwordCtrl(): FormControl {
    return this.form.get('password') as FormControl;
  }
}

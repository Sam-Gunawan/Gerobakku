import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vendor-application-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vendor-application-page.component.html',
  styleUrls: ['./vendor-application-page.component.scss']
})
export class VendorApplicationPageComponent implements OnInit {
  applicationForm!: FormGroup;
  isSubmitting = false;
  idCardPreview: string | null = null;
  selfiePreview: string | null = null;
  idCardFile: File | null = null;
  selfieFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.applicationForm = this.fb.group({
      idCard: [null, Validators.required],
      selfie: [null, Validators.required]
    });
  }

  onIdCardSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.idCardFile = file;
      this.applicationForm.patchValue({ idCard: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.idCardPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSelfieSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selfieFile = file;
      this.applicationForm.patchValue({ selfie: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selfiePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeIdCard(): void {
    this.idCardFile = null;
    this.idCardPreview = null;
    this.applicationForm.patchValue({ idCard: null });
  }

  removeSelfie(): void {
    this.selfieFile = null;
    this.selfiePreview = null;
    this.applicationForm.patchValue({ selfie: null });
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) {
      Object.keys(this.applicationForm.controls).forEach(key => {
        this.applicationForm.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // TODO: Implement actual API call to submit vendor application
    const formData = new FormData();
    if (this.idCardFile) formData.append('idCard', this.idCardFile);
    if (this.selfieFile) formData.append('selfie', this.selfieFile);

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      alert('Vendor application submitted successfully!');
      this.router.navigate(['/vendor-store-details']);
    }, 2000);
  }

  getErrorMessage(controlName: string): string {
    const control = this.applicationForm.get(controlName);

    if (control?.hasError('required')) {
      return 'This field is required';
    }

    return '';
  }
}

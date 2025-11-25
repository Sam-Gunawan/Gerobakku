import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
    selector: 'app-vendor-store-details-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './vendor-store-details-page.component.html',
    styleUrls: ['./vendor-store-details-page.component.scss']
})
export class VendorStoreDetailsPageComponent implements OnInit {
    storeForm!: FormGroup;
    isSubmitting = false;
    storeImagePreview: string | null = null;
    storeImageFile: File | null = null;

    categories = [
        'Indonesian Food',
        'Beverages',
        'Snacks',
        'Desserts',
        'Fast Food',
        'Other'
    ];

    constructor(
        private fb: FormBuilder,
        public router: Router
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.requestLocation();
    }

    initForm(): void {
        this.storeForm = this.fb.group({
            storeName: ['', Validators.required],
            category: ['', Validators.required],
            description: [''],
            address: ['', Validators.required],
            latitude: [null, Validators.required],
            longitude: [null, Validators.required],
            openTime: ['', Validators.required],
            closeTime: ['', Validators.required],
            isHalal: [false],
            storeImage: [null, Validators.required]
        });
    }

    requestLocation(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.storeForm.patchValue({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    }

    onUseCurrentLocation(): void {
        this.requestLocation();
    }

    onStoreImageSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            this.storeImageFile = file;
            this.storeForm.patchValue({ storeImage: file });

            const reader = new FileReader();
            reader.onload = (e) => {
                this.storeImagePreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removeStoreImage(): void {
        this.storeImageFile = null;
        this.storeImagePreview = null;
        this.storeForm.patchValue({ storeImage: null });
    }

    onSubmit(): void {
        if (this.storeForm.invalid) {
            Object.keys(this.storeForm.controls).forEach(key => {
                this.storeForm.controls[key].markAsTouched();
            });
            return;
        }
        this.isSubmitting = true;

        // TODO: Implement actual API call
        const formData = new FormData();
        Object.keys(this.storeForm.value).forEach(key => {
            if (this.storeForm.value[key] !== null) {
                formData.append(key, this.storeForm.value[key]);
            }
        });

        // Simulate API call
        setTimeout(() => {
            this.isSubmitting = false;
            alert('Store registered successfully! Welcome to Gerobakku.');
            this.router.navigate(['/vendor-dashboard']);
        }, 2000);
    }
}
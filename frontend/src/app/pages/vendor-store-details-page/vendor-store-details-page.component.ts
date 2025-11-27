import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MapLocationPickerComponent } from '../../shared/components/map-location-picker/map-location-picker.component';
import { VendorService } from '../../services/vendor.service';
import { AuthService } from '../../services/auth.service';


@Component({
    selector: 'app-vendor-store-details-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MapLocationPickerComponent],
    templateUrl: './vendor-store-details-page.component.html',
    styleUrls: ['./vendor-store-details-page.component.scss']
})
export class VendorStoreDetailsPageComponent implements OnInit {
    storeForm!: FormGroup;
    isSubmitting = false;
    storeImagePreview: string | null = null;
    storeImageFile: File | null = null;

    categories = [
        { id: 1, name: 'Western' },
        { id: 2, name: 'Japanese' },
        { id: 3, name: 'Indonesian' },
        { id: 4, name: 'Korean' },
        { id: 5, name: 'Middle-eastern' },
        { id: 6, name: 'Beverages' },
        { id: 7, name: 'Others' }
    ];

    constructor(
        private fb: FormBuilder,
        public router: Router,
        private vendorService: VendorService,  // ADD
        private authService: AuthService
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

    // onSubmit(): void {
    //     if (this.storeForm.invalid) {
    //         Object.keys(this.storeForm.controls).forEach(key => {
    //             this.storeForm.controls[key].markAsTouched();
    //         });
    //         return;
    //     }
    //     this.isSubmitting = true;

    //     // TODO: Implement actual API call
    //     const formData = new FormData();
    //     Object.keys(this.storeForm.value).forEach(key => {
    //         if (this.storeForm.value[key] !== null) {
    //             formData.append(key, this.storeForm.value[key]);
    //         }
    //     });

    //     // Simulate API call
    //     setTimeout(() => {
    //         this.isSubmitting = false;
    //         alert('Store registered successfully! Welcome to Gerobakku.');
    //         this.router.navigate(['/vendor-dashboard']);
    //     }, 2000);
    // }

    onLocationSelected(coords: { lat: number; lon: number }): void {
        this.storeForm.patchValue({
            latitude: coords.lat,
            longitude: coords.lon
        });
    }

    async onSubmit(): Promise<void> {
        if (this.storeForm.invalid) {
            Object.keys(this.storeForm.controls).forEach(key => {
                this.storeForm.controls[key].markAsTouched();
            });
            return;
        }

        this.isSubmitting = true;
        try {
            // Get current user
            const user = await this.authService.getCurrentUser().toPromise();
            if (!user) {
                alert('Please login first');
                this.router.navigate(['/login']);
                return;
            }

            // Retrieve stored files from sessionStorage (from vendor-application page)
            const ktpBase64 = sessionStorage.getItem('vendor_ktp');
            const selfieBase64 = sessionStorage.getItem('vendor_selfie');
            if (!ktpBase64 || !selfieBase64 || !this.storeImageFile) {
                alert('Missing required files. Please start from the beginning.');
                this.router.navigate(['/vendor-application']);
                return;
            }

            // Convert base64 back to File
            const ktpFile = await this.base64ToFile(ktpBase64, 'ktp.jpg');
            const selfieFile = await this.base64ToFile(selfieBase64, 'selfie.jpg');

            // Prepare registration data
            const registrationData = {
                user_id: parseInt(user.userId),
                store_name: this.storeForm.value.storeName,
                store_description: this.storeForm.value.description || 'No description',
                category_id: parseInt(this.storeForm.value.category),
                address: this.storeForm.value.address,
                is_halal: this.storeForm.value.isHalal || false,
                open_time: this.parseTime(this.storeForm.value.openTime),
                close_time: this.parseTime(this.storeForm.value.closeTime),
                latitude: this.storeForm.value.latitude,
                longitude: this.storeForm.value.longitude
            };

            // Submit to backend
            this.vendorService.registerVendorAndStore(
                registrationData,
                ktpFile,
                selfieFile,
                this.storeImageFile
            ).subscribe({
                next: (response) => {
                    // Clear session storage
                    sessionStorage.removeItem('vendor_ktp');
                    sessionStorage.removeItem('vendor_selfie');
                    this.isSubmitting = false;
                    alert(`Success! ${response.message}`);
                    this.router.navigate(['/vendor-dashboard']);
                },
                error: (err) => {
                    this.isSubmitting = false;
                    console.error('Registration error:', err);
                    alert(err.error?.detail || 'Registration failed. Please try again.');
                }
            });
        } catch (error) {
            this.isSubmitting = false;
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    }

    async base64ToFile(base64: string, filename: string): Promise<File> {
        const res = await fetch(base64);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    }

    parseTime(timeString: string): number {
        // Convert "HH:MM" to minutes since midnight (0-1439)
        const [hour, minute] = timeString.split(':').map(Number);
        return (hour * 60) + minute;
    }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardData, VendorRegistrationData, VendorRegistrationResponse } from '../models/vendor.model';


@Injectable({
    providedIn: 'root'
})
export class VendorService {
    private readonly API_URL = environment.apiUrl || 'http://localhost:8000';
    constructor(private http: HttpClient) { }

    // Get vendor's store ID from backend
    getVendorStoreId(userId: number): Observable<number> {
        // You'll need a backend endpoint for this
        // For now, using a workaround: get all stores and find by vendor
        return this.http.get<any>(`${this.API_URL}/vendor/my-store`);
    }

    // Get dashboard data using existing endpoints
    getDashboardData(storeId: number): Observable<DashboardData> {
        return forkJoin({
            store: this.http.get(`${this.API_URL}/stores/${storeId}`),
            reviewStats: this.http.get(`${this.API_URL}/stores/${storeId}/reviews/stats`)
        });
    }

    // Update store open/close status
    updateStoreStatus(storeId: number, isOpen: boolean): Observable<any> {
        const endpoint = isOpen ? 'open' : 'close';
        return this.http.put(`${this.API_URL}/stores/${storeId}/${endpoint}`, {});
    }

    // Update store hours
    updateStoreHours(storeId: number, openTime: number, closeTime: number): Observable<any> {
        return this.http.put(`${this.API_URL}/stores/${storeId}/hours`, {
            open_time: openTime,
            close_time: closeTime
        });
    }

    // Update halal status
    updateHalalStatus(storeId: number, isHalal: boolean): Observable<any> {
        return this.http.put(`${this.API_URL}/stores/${storeId}/halal`, {
            is_halal: isHalal
        });
    }

    // Register vendor and store
    registerVendorAndStore(
        data: VendorRegistrationData,
        ktpFile: File | null,
        selfieFile: File | null,
        storeImageFile: File | null
    ): Observable<VendorRegistrationResponse> {
        const formData = new FormData();

        formData.append('user_id', data.user_id.toString());
        formData.append('store_name', data.store_name);
        formData.append('store_description', data.store_description);
        formData.append('category_id', data.category_id.toString());
        formData.append('address', data.address);
        formData.append('is_halal', data.is_halal.toString());
        formData.append('open_time', data.open_time.toString());
        formData.append('close_time', data.close_time.toString());

        if (ktpFile) formData.append('ktp', ktpFile);
        if (selfieFile) formData.append('selfie', selfieFile);
        // if (storeImageFile) formData.append('store_img', storeImageFile);
        formData.append('store_img', 'assets/default_store_image.jpg'); // Revert to default image path for demonstration purposes

        return this.http.post<VendorRegistrationResponse>(
            `${this.API_URL}/vendor/registerVendorAndStore`,
            formData
        );
    }
}
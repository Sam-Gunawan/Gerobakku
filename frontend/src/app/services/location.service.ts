import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subscription, switchMap, catchError, of, map, BehaviorSubject } from 'rxjs';
import { Store, LocationPoint } from '../models/store.model';
import { environment } from '../../environments/environment';
interface LocationUpdate {
    store_id: number;
    current_location: { lat: number; lon: number };
    location_updated_at: string;
}
@Injectable({ providedIn: 'root' })
export class LocationService {
    private readonly API_URL = environment.apiUrl || 'http://localhost:8000';
    private readonly POLLING_INTERVAL = 3000;
    private pollingSubscription?: Subscription;
    private vendorLocationsSubject = new BehaviorSubject<Store[]>([]);
    public vendorLocations$ = this.vendorLocationsSubject.asObservable();
    constructor(private http: HttpClient) { }
    private transformStore(apiStore: any): Store {
        return {
            storeId: apiStore.store_id?.toString() || apiStore.storeId,
            vendorId: apiStore.vendor_id?.toString() || apiStore.vendorId,
            name: apiStore.name,
            description: apiStore.description,
            rating: apiStore.rating,
            category: apiStore.category_id?.toString() || apiStore.category,
            address: apiStore.address,
            isOpen: apiStore.is_open !== undefined ? apiStore.is_open : apiStore.isOpen,
            isHalal: apiStore.is_halal !== undefined ? apiStore.is_halal : apiStore.isHalal,
            openTime: apiStore.open_time?.toString() || apiStore.openTime,
            closeTime: apiStore.close_time?.toString() || apiStore.closeTime,
            storeImageUrl: apiStore.store_image_url || apiStore.storeImageUrl,
            menu: apiStore.menu || [],
            currentLocation: apiStore.current_location ? {
                lat: apiStore.current_location.lat,
                lon: apiStore.current_location.lon
            } : null,
            locationUpdatedAt: apiStore.location_updated_at ? new Date(apiStore.location_updated_at) : null
        };
    }
    getUserLocation(): Promise<LocationPoint> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => reject(err),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    }
    getVendorLocations(): Observable<Store[]> {
        return this.http.get<any[]>(`${this.API_URL}/stores`).pipe(
            map(stores => stores.map(s => this.transformStore(s))),
            catchError(() => of([]))
        );
    }
    getLocationUpdates(): Observable<LocationUpdate[]> {
        return this.http.get<LocationUpdate[]>(`${this.API_URL}/vendor/locations`).pipe(
            catchError(() => of([]))
        );
    }
    // Initialize - fetch stores once, NO polling
    initializeStores(): void {
        this.getVendorLocations().subscribe(stores => {
            console.log('✅ Loaded:', stores.length, 'stores');
            this.vendorLocationsSubject.next(stores);
        });
    }
    // Start polling (call when simulation starts)
    startPolling(): void {
        if (this.pollingSubscription) return;

        console.log('▶️ Polling started');
        this.pollingSubscription = interval(this.POLLING_INTERVAL).pipe(
            switchMap(() => this.getLocationUpdates())
        ).subscribe(updates => {
            const stores = this.vendorLocationsSubject.value.map(store => {
                const update = updates.find(u => u.store_id === parseInt(store.storeId));
                return update ? { ...store, currentLocation: update.current_location } : store;
            });
            console.log('📍 Updated:', updates.length, 'locations');
            this.vendorLocationsSubject.next(stores);
        });
    }
    // Stop polling
    stopPolling(): void {
        this.pollingSubscription?.unsubscribe();
        this.pollingSubscription = undefined;
        console.log('⏸️ Polling stopped');
    }
    // Start simulation + polling
    startSimulation(): Observable<any> {
        return this.http.post(`${this.API_URL}/vendor/simulate3Vendors`, {}).pipe(
            map(res => { this.startPolling(); return res; })
        );
    }
}
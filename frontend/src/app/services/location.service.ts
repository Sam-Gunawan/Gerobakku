import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, catchError, of, from, BehaviorSubject } from 'rxjs';
import { Store, LocationPoint } from '../models/store.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private readonly API_URL = environment.apiUrl || 'http://localhost:8000';
    private readonly POLLING_INTERVAL = 3000; // 3 seconds

    // BehaviorSubject to hold current vendor locations
    private vendorLocationsSubject = new BehaviorSubject<Store[]>([]);
    public vendorLocations$ = this.vendorLocationsSubject.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * Get user's current location using browser Geolocation API
     * Returns a Promise that resolves with {lat, lon} or rejects with error
     */
    getUserLocation(): Promise<LocationPoint> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage = 'Unknown error occurred';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * Fetch all vendor locations from the API (one-time)
     */
    getVendorLocations(): Observable<Store[]> {
        return this.http.get<Store[]>(`${this.API_URL}/stores`).pipe(
            catchError(error => {
                console.error('Error fetching vendor locations:', error);
                return of([]);
            })
        );
    }

    /**
     * Start polling for vendor locations at regular intervals
     * Returns an Observable that emits updated store locations every POLLING_INTERVAL ms
     */
    startPollingVendorLocations(): Observable<Store[]> {
        return interval(this.POLLING_INTERVAL).pipe(
            switchMap(() => this.getVendorLocations()),
            catchError(error => {
                console.error('Error in polling vendor locations:', error);
                return of([]);
            })
        );
    }

    /**
     * Initialize polling and update the BehaviorSubject
     * Call this once on component initialization
     */
    initPolling(): void {
        // Initial fetch
        this.getVendorLocations().subscribe(stores => {
            this.vendorLocationsSubject.next(stores);
        });

        // Start polling
        this.startPollingVendorLocations().subscribe(stores => {
            this.vendorLocationsSubject.next(stores);
        });
    }

    /**
     * Get a specific store details including menu
     */
    getStoreDetails(storeId: number): Observable<Store> {
        return this.http.get<Store>(`${this.API_URL}/stores/${storeId}`);
    }

    /**
     * Watch user location continuously (optional - for live tracking)
     * Returns an Observable that emits user location updates
     */
    watchUserLocation(): Observable<LocationPoint> {
        return new Observable(observer => {
            if (!navigator.geolocation) {
                observer.error(new Error('Geolocation not supported'));
                return;
            }

            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    observer.next({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    observer.error(error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0
                }
            );

            // Cleanup function
            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { LocationPoint } from '../models/store.model';

export interface RouteResponse {
    coordinates: [number, number][]; // [lon, lat] pairs
    distance: number; // in meters
    duration: number; // in seconds
}

@Injectable({
    providedIn: 'root'
})
export class RoutingService {
    private readonly OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

    constructor(private http: HttpClient) { }

    /**
     * Get route between two points using OSRM
     * @param from Starting location
     * @param to Destination location
     * @returns Observable with route coordinates and metadata
     */
    getRoute(from: LocationPoint, to: LocationPoint): Observable<RouteResponse | null> {
        // OSRM expects: {lon},{lat};{lon},{lat}
        const url = `${this.OSRM_URL}/${from.lon},${from.lat};${to.lon},${to.lat}`;
        const params = {
            overview: 'full',
            geometries: 'geojson',
            steps: 'false'
        };

        return this.http.get<any>(url, { params }).pipe(
            map(response => {
                if (response.code !== 'Ok' || !response.routes || response.routes.length === 0) {
                    console.error('OSRM routing error:', response);
                    return null;
                }

                const route = response.routes[0];
                const geometry = route.geometry;

                return {
                    coordinates: geometry.coordinates as [number, number][],
                    distance: route.distance,
                    duration: route.duration
                };
            }),
            catchError(error => {
                console.error('Error fetching route:', error);
                return of(null);
            })
        );
    }

    /**
     * Format distance for display
     */
    formatDistance(meters: number): string {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    }

    /**
     * Format duration for display
     */
    formatDuration(seconds: number): string {
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    }
}

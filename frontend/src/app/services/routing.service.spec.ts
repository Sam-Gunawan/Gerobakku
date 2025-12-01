/**
 * Unit tests for RoutingService
 * 
 * This file demonstrates:
 * - Testing pure utility functions (formatDistance, formatDuration)
 * - Mocking external API calls (OSRM)
 * - Testing error handling
 * - Parametrized tests with multiple inputs
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RoutingService, RouteResponse } from './routing.service';
import { LocationPoint } from '../models/store.model';

describe('RoutingService', () => {
    let service: RoutingService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RoutingService]
        });
        service = TestBed.inject(RoutingService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ===== ROUTE FETCHING TESTS =====

    describe('getRoute', () => {
        it('should make GET request to OSRM with correct coordinates', () => {
            // Arrange
            const from: LocationPoint = { lat: -6.2443, lon: 106.8385 };
            const to: LocationPoint = { lat: -6.2500, lon: 106.8400 };

            // Act
            service.getRoute(from, to).subscribe();

            // Assert
            const req = httpMock.expectOne((request) =>
                request.url.includes('router.project-osrm.org/route/v1/driving')
            );

            expect(req.request.method).toBe('GET');
            expect(req.request.url).toContain(`${from.lon},${from.lat}`);
            expect(req.request.url).toContain(`${to.lon},${to.lat}`);
            expect(req.request.params.get('overview')).toBe('full');
            expect(req.request.params.get('geometries')).toBe('geojson');

            // Simulate response
            req.flush({
                code: 'Ok',
                routes: [{
                    geometry: { coordinates: [[106.8385, -6.2443], [106.8400, -6.2500]] },
                    distance: 1234,
                    duration: 300
                }]
            });
        });

        it('should correctly parse OSRM response', () => {
            // Arrange
            const from: LocationPoint = { lat: -6.2443, lon: 106.8385 };
            const to: LocationPoint = { lat: -6.2500, lon: 106.8400 };

            const mockOSRMResponse = {
                code: 'Ok',
                routes: [{
                    geometry: {
                        coordinates: [
                            [106.8385, -6.2443],
                            [106.8390, -6.2450],
                            [106.8400, -6.2500]
                        ]
                    },
                    distance: 1500,
                    duration: 360
                }]
            };

            // Act
            service.getRoute(from, to).subscribe(result => {
                // Assert
                expect(result).not.toBeNull();
                expect(result!.coordinates.length).toBe(3);
                expect(result!.distance).toBe(1500);
                expect(result!.duration).toBe(360);
                expect(result!.coordinates[0]).toEqual([106.8385, -6.2443]);
            });

            const req = httpMock.expectOne((request) =>
                request.url.includes('router.project-osrm.org')
            );
            req.flush(mockOSRMResponse);
        });

        it('should return null when OSRM returns error', () => {
            // Arrange
            const from: LocationPoint = { lat: -6.2443, lon: 106.8385 };
            const to: LocationPoint = { lat: -6.2500, lon: 106.8400 };

            const mockErrorResponse = {
                code: 'NoRoute',
                message: 'No route found'
            };

            // Act
            service.getRoute(from, to).subscribe(result => {
                // Assert
                expect(result).toBeNull();
            });

            const req = httpMock.expectOne((request) =>
                request.url.includes('router.project-osrm.org')
            );
            req.flush(mockErrorResponse);
        });

        it('should handle HTTP errors gracefully', () => {
            // Arrange
            const from: LocationPoint = { lat: -6.2443, lon: 106.8385 };
            const to: LocationPoint = { lat: -6.2500, lon: 106.8400 };

            // Act
            service.getRoute(from, to).subscribe(result => {
                // Assert - should return null instead of throwing error
                expect(result).toBeNull();
            });

            const req = httpMock.expectOne((request) =>
                request.url.includes('router.project-osrm.org')
            );

            // Simulate network error
            req.error(new ErrorEvent('Network error'));
        });

        it('should return null when no routes are found', () => {
            // Arrange
            const from: LocationPoint = { lat: -6.2443, lon: 106.8385 };
            const to: LocationPoint = { lat: -6.2500, lon: 106.8400 };

            const mockEmptyResponse = {
                code: 'Ok',
                routes: []  // Empty routes array
            };

            // Act
            service.getRoute(from, to).subscribe(result => {
                // Assert
                expect(result).toBeNull();
            });

            const req = httpMock.expectOne((request) =>
                request.url.includes('router.project-osrm.org')
            );
            req.flush(mockEmptyResponse);
        });
    });

    // ===== DISTANCE FORMATTING TESTS =====

    describe('formatDistance', () => {
        // Test cases: [input meters, expected output]
        const testCases: [number, string][] = [
            [0, '0 m'],
            [50, '50 m'],
            [500, '500 m'],
            [999, '999 m'],
            [1000, '1.0 km'],
            [1234, '1.2 km'],
            [1500, '1.5 km'],
            [2500, '2.5 km'],
            [10000, '10.0 km'],
            [12345, '12.3 km']
        ];

        testCases.forEach(([meters, expected]) => {
            it(`should format ${meters} meters as "${expected}"`, () => {
                // Act
                const result = service.formatDistance(meters);

                // Assert
                expect(result).toBe(expected);
            });
        });

        it('should round meters to nearest integer', () => {
            expect(service.formatDistance(123.7)).toBe('124 m');
            expect(service.formatDistance(456.3)).toBe('456 m');
        });

        it('should show one decimal place for kilometers', () => {
            expect(service.formatDistance(1234)).toBe('1.2 km');
            expect(service.formatDistance(5678)).toBe('5.7 km');
        });
    });

    // ===== DURATION FORMATTING TESTS =====

    describe('formatDuration', () => {
        // Test cases: [input seconds, expected output]
        const testCases: [number, string][] = [
            [0, '0 min'],
            [30, '1 min'],      // Rounds up
            [60, '1 min'],
            [120, '2 min'],
            [300, '5 min'],
            [600, '10 min'],
            [3540, '59 min'],
            [3600, '1h 0min'],
            [3660, '1h 1min'],
            [7200, '2h 0min'],
            [7320, '2h 2min'],
            [10800, '3h 0min']
        ];

        testCases.forEach(([seconds, expected]) => {
            it(`should format ${seconds} seconds as "${expected}"`, () => {
                // Act
                const result = service.formatDuration(seconds);

                // Assert
                expect(result).toBe(expected);
            });
        });

        it('should round seconds to nearest minute', () => {
            // 89 seconds = 1.48 minutes ≈ 1 minute
            expect(service.formatDuration(89)).toBe('1 min');

            // 91 seconds = 1.52 minutes ≈ 2 minutes
            expect(service.formatDuration(91)).toBe('2 min');
        });

        it('should show hours and minutes for long durations', () => {
            // 5400 seconds = 90 minutes = 1h 30min
            expect(service.formatDuration(5400)).toBe('1h 30min');

            // 9000 seconds = 150 minutes = 2h 30min
            expect(service.formatDuration(9000)).toBe('2h 30min');
        });
    });

    // ===== EDGE CASES =====

    describe('edge cases', () => {
        it('should handle very small distances', () => {
            expect(service.formatDistance(0.5)).toBe('1 m');
            expect(service.formatDistance(1)).toBe('1 m');
        });

        it('should handle very large distances', () => {
            expect(service.formatDistance(100000)).toBe('100.0 km');
            expect(service.formatDistance(999999)).toBe('1000.0 km');
        });

        it('should handle very small durations', () => {
            expect(service.formatDuration(1)).toBe('0 min');
            expect(service.formatDuration(29)).toBe('0 min');
        });

        it('should handle very large durations', () => {
            // 24 hours = 86400 seconds
            expect(service.formatDuration(86400)).toBe('24h 0min');
        });
    });
});

/**
 * Unit tests for AuthService (Frontend)
 * 
 * This file demonstrates:
 * - How to test Angular services
 * - How to mock HTTP requests with HttpClientTestingModule
 * - How to test Observables
 * - How to verify localStorage interactions
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { LoginRequest, RegisterRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorageService: jasmine.SpyObj<TokenStorageService>;

  // This runs before each test
  beforeEach(() => {
    // Create a spy object for TokenStorageService
    const tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'setSession',
      'clear',
      'getToken',
      'getUser'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],  // Mock HTTP requests
      providers: [
        AuthService,
        { provide: TokenStorageService, useValue: tokenStorageSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenStorageService = TestBed.inject(TokenStorageService) as jasmine.SpyObj<TokenStorageService>;
  });

  // Verify no outstanding HTTP requests after each test
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== LOGIN TESTS =====

  describe('login', () => {
    it('should make POST request to /auth/login with credentials', () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: LoginResponse = {
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        user: {
          userId: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: new Date(),
          isVerified: true
        }
      };

      // Act
      service.login(loginRequest).subscribe(response => {
        // Assert - response should match mock
        expect(response).toEqual(mockResponse);
      });

      // Assert - HTTP request was made correctly
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);

      // Simulate server response
      req.flush(mockResponse);
    });

    it('should store token and user in TokenStorage after successful login', () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: LoginResponse = {
        access_token: 'test-token-123',
        token_type: 'bearer',
        user: {
          userId: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: new Date(),
          isVerified: true
        }
      };

      // Act
      service.login(loginRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);

      // Assert - TokenStorage.setSession was called
      expect(tokenStorageService.setSession).toHaveBeenCalledWith(
        'test-token-123',
        mockResponse.user
      );
    });

    it('should handle login error', () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      const errorMessage = 'Invalid credentials';

      // Act
      service.login(loginRequest).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
        }
      });

      // Simulate error response
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ detail: errorMessage }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ===== REGISTER TESTS =====

  describe('register', () => {
    it('should make POST request to /auth/register with user data', () => {
      // Arrange
      const registerRequest: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        full_name: 'New User'
      };

      const mockResponse: LoginResponse = {
        access_token: 'new-user-token',
        token_type: 'bearer',
        user: {
          userId: '2',
          email: 'newuser@example.com',
          fullName: 'New User',
          createdAt: new Date(),
          isVerified: false
        }
      };

      // Act
      service.register(registerRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);

      req.flush(mockResponse);
    });

    it('should store token after successful registration', () => {
      // Arrange
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User'
      };

      const mockResponse: LoginResponse = {
        access_token: 'registration-token',
        token_type: 'bearer',
        user: {
          userId: '3',
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: new Date(),
          isVerified: false
        }
      };

      // Act
      service.register(registerRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush(mockResponse);

      // Assert
      expect(tokenStorageService.setSession).toHaveBeenCalledWith(
        'registration-token',
        mockResponse.user
      );
    });
  });

  // ===== LOGOUT TESTS =====

  describe('logout', () => {
    it('should clear token storage', () => {
      // Act
      service.logout();

      // Assert
      expect(tokenStorageService.clear).toHaveBeenCalled();
    });

    it('should be callable multiple times without error', () => {
      // Act - call logout twice
      service.logout();
      service.logout();

      // Assert - clear should be called twice
      expect(tokenStorageService.clear).toHaveBeenCalledTimes(2);
    });
  });

  // ===== GET CURRENT USER TESTS =====

  describe('getCurrentUser', () => {
    it('should fetch current user from /auth/me', () => {
      // Arrange
      const mockApiResponse = {
        user_id: 5,
        email: 'current@example.com',
        full_name: 'Current User',
        created_at: '2024-01-01T00:00:00Z',
        is_verified: true
      };

      const expectedUser: User = {
        userId: 5 as any,  // API returns number, not string
        email: 'current@example.com',
        fullName: 'Current User',
        createdAt: '2024-01-01T00:00:00Z' as any,  // API returns string, not Date
        isVerified: true
      };

      // Act
      service.getCurrentUser().subscribe(user => {
        // Assert - API response is transformed to frontend model
        expect(user).toEqual(expectedUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');

      req.flush(mockApiResponse);
    });

    it('should transform snake_case to camelCase', () => {
      // Arrange - API uses snake_case
      const mockApiResponse = {
        user_id: 10,
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2024-12-01T00:00:00Z',
        is_verified: false
      };

      // Act
      service.getCurrentUser().subscribe(user => {
        // Assert - frontend model uses camelCase
        expect(String(user.userId)).toBe('10');
        expect(user.fullName).toBe('Test User');
        expect(user.isVerified).toBe(false);

        // Verify no snake_case properties
        expect((user as any).user_id).toBeUndefined();
        expect((user as any).full_name).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      req.flush(mockApiResponse);
    });

    it('should handle 401 error when user is not authenticated', () => {
      // Act
      service.getCurrentUser().subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      req.flush(
        { detail: 'Not authenticated' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });
});

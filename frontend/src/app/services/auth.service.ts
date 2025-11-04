import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
    LoginResponse,
    LoginRequest,
    RegisterRequest
} from "../models/auth.model";
import { map, Observable, tap } from "rxjs";
import { TokenStorageService } from "../services/token-storage.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private tokenStorage: TokenStorageService
    ) {}

    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
            tap(response => {
                this.tokenStorage.setSession(response.access_token, response.user);
            })
        );
    }

    register(request: RegisterRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, request).pipe(
            tap(response => {
                this.tokenStorage.setSession(response.access_token, response.user);
            })
        );
    }

    verifyEmail() {
        // TODO: Implement email verification logic
    }

    logout(): void {
        this.tokenStorage.clear();
    }

    getCurrentUser() {
        return this.tokenStorage.getUser();
    }
}

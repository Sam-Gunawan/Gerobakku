import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
} from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenStorageService } from "../services/token-storage.service";


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private tokenStorage: TokenStorageService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.tokenStorage.getToken();

        // Skip auth header for external APIs (e.g., OSRM routing)
        const isOsrm = request.url.includes('osrm');
        const isExternalApi = request.url.includes('cartocdn');

        // Skip external APIs
        if (isOsrm || isExternalApi) {
            return next.handle(request);
        }

        // Add auth token to all other requests (including localhost API)
        if (token) {
            const authReq = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('🔐 Adding auth token to:', request.url);  // DEBUG
            return next.handle(authReq);
        }
        console.warn('⚠️ No token found for:', request.url);  // DEBUG
        return next.handle(request);
    }
}
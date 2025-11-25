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

        // Skip auth header for external APIs (e.g., OSRM)
        const isExternalUrl = request.url.startsWith('http://') || request.url.startsWith('https://');
        const isOwnApi = request.url.includes('localhost') || request.url.includes('your-api-domain.com');

        // If no token OR external URL, proceed without adding the Authorization header
        if (!token || (isExternalUrl && !isOwnApi)) {
            return next.handle(request);
        }

        // Only add the Authorization header for internal API calls
        const authReq = request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        })

        return next.handle(authReq);
    }
}

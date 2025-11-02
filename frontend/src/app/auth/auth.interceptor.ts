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
    constructor(private tokenStorage: TokenStorageService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.tokenStorage.getToken();

        // If no token, proceed without adding the Authorization header
        if (!token) {
            return next.handle(request);
        }

        // Only add the Authorization header if the token exists
        const authReq = request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        })

        return next.handle(authReq);
    }
}

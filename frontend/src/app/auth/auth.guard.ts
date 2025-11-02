import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { TokenStorageService } from "../services/token-storage.service";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private tokenStorage: TokenStorageService,
        private router: Router
    ) {}

    // Guard to check if the user is authenticated
    // Gotcha: canActivate is a pre-defined name used by Angular Router
    canActivate(): boolean {
        if (this.tokenStorage.isLoggedIn()) {
            return true;
        }

        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        return false;
    }
}

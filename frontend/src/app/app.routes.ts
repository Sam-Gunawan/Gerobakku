import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthGuard } from './auth/auth.guard';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { MapDashboardComponent } from './pages/home-page/map-dashboard/map-dashboard.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { VendorApplicationPageComponent } from './pages/vendor-application-page/vendor-application-page.component';
import { VendorDashboardComponent } from './pages/vendor-page/vendor-dashboard/vendor-dashboard.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'register', component: RegisterPageComponent },
    { path: 'home', component: MapDashboardComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard] },
    { path: 'vendor-application', component: VendorApplicationPageComponent, canActivate: [AuthGuard] },
    { path: 'vendor-dashboard', component: VendorDashboardComponent, canActivate: [AuthGuard] },
];

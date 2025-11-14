import { Routes } from '@angular/router';
<<<<<<< HEAD
// Ensure this path and the exported class name from the file are correct
import { LoginPageComponent } from './components/login-page/login-page.component';
import { MapDashboardComponent } from './components/map-dashboard/map-dashboard.component';
=======
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthGuard } from './auth/auth.guard';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
>>>>>>> 6066a50fd1a3e0b68e49cb0ea9511ba92130d220

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginPageComponent },
<<<<<<< HEAD
    { path: 'dashboard', component: MapDashboardComponent },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
=======
    { path: 'register', component: RegisterPageComponent },
    { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
];
>>>>>>> 6066a50fd1a3e0b68e49cb0ea9511ba92130d220

import { Routes } from '@angular/router';
// Ensure this path and the exported class name from the file are correct
import { LoginPageComponent } from './components/login-page/login-page.component';
import { MapDashboardComponent } from './components/map-dashboard/map-dashboard.component';

export const routes: Routes = [
    { path: 'login', component: LoginPageComponent },
    { path: 'dashboard', component: MapDashboardComponent },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
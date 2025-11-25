import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-loading-overlay',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loading-overlay.component.html',
    styleUrl: './loading-overlay.component.scss'
})
export class LoadingOverlayComponent {
    @Input() isVisible: boolean = false;
    @Input() title: string = 'Loading';
    @Input() message: string = 'Please wait...';
    @Input() spinnerColor: string = '#8B4513'; // Brand brown color
}
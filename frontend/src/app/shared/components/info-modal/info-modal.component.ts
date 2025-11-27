import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-info-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './info-modal.component.html',
    styleUrl: './info-modal.component.scss'
})
export class InfoModalComponent {
    @Input() title: string = '';
    @Input() content: string = '';
    @Input() isHtml: boolean = false; // Allow HTML content
    @Input() icon: string = '‼';
    @Output() close = new EventEmitter<void>();

    onClose(): void {
        this.close.emit();
    }
}
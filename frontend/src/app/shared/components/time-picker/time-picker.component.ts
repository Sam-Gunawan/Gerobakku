import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
    selector: 'app-time-picker',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TimePickerComponent),
        multi: true
    }],
    templateUrl: './time-picker.component.html',
    styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent implements ControlValueAccessor {
    @Input() disabled = false;

    hours = 0;
    minutes = 0;
    hourOptions = Array.from({ length: 24 }, (_, i) => i);
    minuteOptions = [0, 15, 30, 45];

    private onChange: any = () => { };
    private onTouched: any = () => { };

    writeValue(time: string): void {
        if (time) {
            const [h, m] = time.split(':').map(Number);
            this.hours = h;
            this.minutes = m;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onTimeChange(): void {
        const timeString = `${this.formatNumber(this.hours)}:${this.formatNumber(this.minutes)}`;
        this.onChange(timeString);
        this.onTouched();
    }

    formatNumber(n: number): string {
        return n.toString().padStart(2, '0');
    }
}
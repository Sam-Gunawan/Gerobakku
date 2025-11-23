import { Component, EventEmitter, Output, HostListener, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type SheetState = 'minimized' | 'initial' | 'maximized';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss'
})
export class BottomSheetComponent implements OnInit, OnDestroy {
  heightsPx = {
    minimized: 40, // *** ENSURE this only covers .top-bar height ***
    // New calculation: (55px * 2 rows) + 10px gap + 80px ad + ~30px padding = ~230px
    initial: 240, // *** ADJUSTED VALUE *** - Fine-tune this
    maximized: window.innerHeight * 0.75
  };

  heights = {
    // Make minimized height exactly match the top-bar height defined in CSS
    minimized: `${this.heightsPx.minimized}px`,
    initial: `${this.heightsPx.initial}px`,
    maximized: '75vh'
  };

  sheetState: SheetState = 'initial';
  currentHeight: string = this.heights.initial;

  @Output() heightChange = new EventEmitter<string>();

  private isDragging = false;
  private startY: number | null = null;
  private startHeight: number | null = null;
  private mouseMoveListener?: () => void;
  private mouseUpListener?: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.updateMaxHeightPx();
    this.currentHeight = this.getSheetHeight();
    this.emitHeight();
  }

  ngOnDestroy(): void {
    this.removeGlobalMouseListeners();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMaxHeightPx();
    if (!this.isDragging) {
      this.currentHeight = this.getSheetHeight();
    }
  }

  cycleStateOnClick(): void {
    if (this.isDragging) return;
    if (this.sheetState === 'initial') {
      this.sheetState = 'maximized';
    } else if (this.sheetState === 'maximized') {
      this.sheetState = 'initial';
    }
    this.animateToStateHeight();
  }

  toggleMinMax(): void {
    if (this.isDragging) return;
    this.sheetState = (this.sheetState === 'minimized') ? 'initial' : 'minimized';
    this.animateToStateHeight();
  }

  private updateMaxHeightPx(): void {
    this.heightsPx.maximized = window.innerHeight * 0.75;
  }

  getSheetHeight(): string {
    return this.heights[this.sheetState];
  }

  private emitHeight(): void {
    this.heightChange.emit(this.getSheetHeight());
  }

  private animateToStateHeight(): void {
    this.currentHeight = this.getSheetHeight();
    this.emitHeight();
  }

  private handleDragStart(clientY: number, target: HTMLElement): void {
    const isButton = target.closest('.toggle-button');
    const isTopBar = target.closest('.top-bar');
    if (isTopBar && !isButton) {
      this.isDragging = true;
      this.startY = clientY;
      this.startHeight = this.el.nativeElement.querySelector('.bottom-sheet').offsetHeight;
      this.renderer.addClass(this.el.nativeElement.querySelector('.bottom-sheet'), 'dragging');
    } else {
      this.isDragging = false;
      this.startY = null;
      this.startHeight = null;
    }
  }

  private handleDragMove(clientY: number): void {
    if (!this.isDragging || this.startY === null || this.startHeight === null) return;
    const deltaY = this.startY - clientY;
    let newHeight = this.startHeight + deltaY;
    // Use the *exact* minimized height as the lower bound during drag visually
    const minPixelHeight = this.heightsPx.minimized;
    const maxPixelHeight = window.innerHeight * 0.95;
    newHeight = Math.max(minPixelHeight, Math.min(newHeight, maxPixelHeight));
    this.currentHeight = `${newHeight}px`;
  }

  private handleDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.renderer.removeClass(this.el.nativeElement.querySelector('.bottom-sheet'), 'dragging');
    if (this.startHeight === null) return;
    const currentActualHeight = this.el.nativeElement.querySelector('.bottom-sheet').offsetHeight;
    const distToMin = Math.abs(currentActualHeight - this.heightsPx.minimized);
    const distToInitial = Math.abs(currentActualHeight - this.heightsPx.initial);
    const distToMax = Math.abs(currentActualHeight - this.heightsPx.maximized);
    if (distToMin <= distToInitial && distToMin <= distToMax) {
      this.sheetState = 'minimized';
    } else if (distToInitial <= distToMin && distToInitial <= distToMax) {
      this.sheetState = 'initial';
    } else {
      this.sheetState = 'maximized';
    }
    this.animateToStateHeight();
    this.startY = null;
    this.startHeight = null;
    this.removeGlobalMouseListeners();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.handleDragStart(event.touches[0].clientY, event.target as HTMLElement);
    if (this.isDragging) event.preventDefault();
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    this.handleDragMove(event.touches[0].clientY);
    event.preventDefault();
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void { this.handleDragEnd(); }
  @HostListener('touchcancel', ['$event'])
  onTouchCancel(event: TouchEvent): void { this.handleDragEnd(); }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.handleDragStart(event.clientY, event.target as HTMLElement);
    if (this.isDragging) {
      event.preventDefault();
      this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.onMouseMove.bind(this));
      this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onMouseUp.bind(this));
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.handleDragMove(event.clientY);
    event.preventDefault();
  }

  onMouseUp(event: MouseEvent): void { this.handleDragEnd(); }

  private removeGlobalMouseListeners(): void {
    if (this.mouseMoveListener) this.mouseMoveListener();
    if (this.mouseUpListener) this.mouseUpListener();
    this.mouseMoveListener = undefined;
    this.mouseUpListener = undefined;
  }
}
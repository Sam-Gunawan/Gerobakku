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
    minimized: 45,
    // Re-adjusted initial height - fine-tune based on inspection
    initial: 245, // Try: (75px * 2 rows) + 10px gap + 50px ad + 30px padding approx
    maximized: window.innerHeight * 0.75
  };

  heights = {
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
    this.updateMaxHeight();
    this.currentHeight = this.getSheetHeight();
    this.emitHeight();
  }

  ngOnDestroy(): void {
    this.removeGlobalMouseListeners();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMaxHeight();
  }

  private updateMaxHeight(): void {
    this.heightsPx.maximized = window.innerHeight * 0.75;
  }

  // Click on handle bar still cycles between initial/maximized
  cycleStateOnClick(): void {
     if (this.sheetState === 'initial') {
        this.sheetState = 'maximized';
    } else if (this.sheetState === 'maximized') {
        this.sheetState = 'initial';
    }
    // Clicking handle when minimized does nothing (use button instead)
    this.currentHeight = this.getSheetHeight();
    this.emitHeight();
  }

  // Button click toggles between minimized and 'initial'
  toggleMinMax(): void {
    // Check the current state and toggle appropriately
    if (this.sheetState === 'minimized') {
      this.sheetState = 'initial'; // Go from minimized to initial
    } else {
      this.sheetState = 'minimized'; // Go from initial or maximized to minimized
    }
    this.currentHeight = this.getSheetHeight();
    this.emitHeight();
  }


  getSheetHeight(): string {
    return this.heights[this.sheetState];
  }

  private emitHeight(): void {
    this.heightChange.emit(this.getSheetHeight());
  }

  // --- Touch & Mouse Event Handlers ---

  private handleDragStart(clientY: number, target: HTMLElement): void {
      // Allow drag start on top-bar *unless* it's the button itself
      const isButton = target.closest('.toggle-button');
      const isTopBar = target.closest('.top-bar');

      if (isTopBar && !isButton) { // <<< MODIFIED CONDITION
          this.isDragging = true;
          this.startY = clientY;
          this.startHeight = this.el.nativeElement.querySelector('.bottom-sheet').offsetHeight;
          this.renderer.addClass(this.el.nativeElement.querySelector('.bottom-sheet'), 'dragging');
      } else {
          // If interaction starts on the button or outside the top bar, don't drag
          this.isDragging = false;
          this.startY = null;
          this.startHeight = null;
      }
  }

  private handleDragMove(clientY: number): void {
      if (!this.isDragging || this.startY === null || this.startHeight === null) return;

      const deltaY = this.startY - clientY;
      let newHeight = this.startHeight + deltaY;

      // Allow slight overdrag visually, but clamp reasonably
      const minPixelHeight = this.heightsPx.minimized - 20;
      const maxPixelHeight = window.innerHeight * 0.95; // Limit near full screen
      newHeight = Math.max(minPixelHeight, Math.min(newHeight, maxPixelHeight));

      this.currentHeight = `${newHeight}px`;
  }

  private handleDragEnd(): void {
      // Check if a drag actually happened (isDragging was set)
      if (!this.isDragging) return;

      this.isDragging = false; // Reset flag first
      this.renderer.removeClass(this.el.nativeElement.querySelector('.bottom-sheet'), 'dragging');

      // Only proceed if startHeight has a value (confirming drag occurred)
      if (this.startHeight === null) return;

      const currentActualHeight = this.el.nativeElement.querySelector('.bottom-sheet').offsetHeight;

      // Determine the closest snap point
      const distToMin = Math.abs(currentActualHeight - this.heightsPx.minimized);
      const distToInitial = Math.abs(currentActualHeight - this.heightsPx.initial);
      const distToMax = Math.abs(currentActualHeight - this.heightsPx.maximized);

      // Snap logic remains the same
      if (distToMin <= distToInitial && distToMin <= distToMax) {
          this.sheetState = 'minimized';
      } else if (distToInitial <= distToMin && distToInitial <= distToMax) {
          this.sheetState = 'initial';
      } else {
          this.sheetState = 'maximized';
      }

      this.currentHeight = this.getSheetHeight();
      this.emitHeight();

      this.startY = null;
      this.startHeight = null;
      this.removeGlobalMouseListeners();
  }

  // Touch Events
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.handleDragStart(event.touches[0].clientY, event.target as HTMLElement);
    if (this.isDragging) event.preventDefault();
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return; // Only prevent default if dragging
    this.handleDragMove(event.touches[0].clientY);
    event.preventDefault();
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.handleDragEnd();
  }

   // Mouse Events
   @HostListener('mousedown', ['$event'])
   onMouseDown(event: MouseEvent): void {
       this.handleDragStart(event.clientY, event.target as HTMLElement);
       if(this.isDragging) {
           event.preventDefault();
            this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.onMouseMove.bind(this));
            this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onMouseUp.bind(this));
       }
   }

   onMouseMove(event: MouseEvent): void {
       if (!this.isDragging) return; // Only handle if dragging started correctly
       this.handleDragMove(event.clientY);
       event.preventDefault();
   }

   onMouseUp(event: MouseEvent): void {
      // handleDragEnd checks isDragging flag internally
      this.handleDragEnd();
   }

   private removeGlobalMouseListeners(): void {
        if (this.mouseMoveListener) this.mouseMoveListener();
        if (this.mouseUpListener) this.mouseUpListener();
        this.mouseMoveListener = undefined;
        this.mouseUpListener = undefined;
    }
}
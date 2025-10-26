import { Component, EventEmitter, Output, HostListener, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf/ngClass

// Define possible states for the bottom sheet
type SheetState = 'minimized' | 'initial' | 'maximized';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule], // Ensure CommonModule is imported
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss'
})
export class BottomSheetComponent implements OnInit, OnDestroy {
  // --- State Definitions ---
  // Define heights for each state in pixels for calculations
  heightsPx = {
    minimized: 45, // Height for top-bar only
    // Adjusted height: (70px * 2 rows) + 10px gap + 50px ad + ~30px padding = ~230px
    initial: 235, // Fine-tune this value by inspecting in browser
    maximized: window.innerHeight * 0.75 // 75vh dynamically calculated
  };

  // String versions for CSS binding
  heights = {
    minimized: `${this.heightsPx.minimized}px`,
    initial: `${this.heightsPx.initial}px`,
    maximized: '75vh' // Use vh for responsiveness in maximized state
  };

  // Current state of the sheet
  sheetState: SheetState = 'initial'; // Start at initial height
  // Tracks the current height being applied via style binding (includes drag effect)
  currentHeight: string = this.heights.initial;

  // Output event to notify parent MapDashboardComponent of height changes (used for target icon)
  @Output() heightChange = new EventEmitter<string>();

  // --- Drag State Variables ---
  private isDragging = false;
  private startY: number | null = null;
  private startHeight: number | null = null;
  // Store global listeners to remove them later
  private mouseMoveListener?: () => void;
  private mouseUpListener?: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // --- Lifecycle Hooks ---
  ngOnInit() {
    this.updateMaxHeightPx(); // Ensure maximized height pixel value is correct on init
    this.currentHeight = this.getSheetHeight(); // Set initial style height
    this.emitHeight(); // Notify parent of initial height
  }

  ngOnDestroy(): void {
    // Clean up global mouse listeners when component is destroyed
    this.removeGlobalMouseListeners();
  }

  // Update max height calculation on window resize
  @HostListener('window:resize')
  onResize(): void {
    this.updateMaxHeightPx();
    // Re-apply current state's height in case 'vh' value changed significantly
    // but only if not currently dragging
    if (!this.isDragging) {
        this.currentHeight = this.getSheetHeight();
        // No need to emit height change on resize, parent should recalculate too
    }
  }

  // --- State Transition Methods ---

  // Click on the handle bar (not the button) cycles between initial and maximized
  cycleStateOnClick(): void {
    if (this.isDragging) return; // Ignore clicks during drag action

    if (this.sheetState === 'initial') {
        this.sheetState = 'maximized';
    } else if (this.sheetState === 'maximized') {
        this.sheetState = 'initial';
    }
    // Clicking handle when minimized does nothing (use button instead)

    this.currentHeight = this.getSheetHeight();
    this.emitHeight();
  }

  // Button click toggles between minimized and 'initial' state
  toggleMinMax(): void {
    if (this.isDragging) return; // Ignore clicks during drag action

    if (this.sheetState === 'minimized') {
      this.sheetState = 'initial'; // Go from minimized to initial
    } else {
      this.sheetState = 'minimized'; // Go from initial or maximized to minimized
    }
    this.currentHeight = this.getSheetHeight();
    this.emitHeight();
  }


  // --- Helper Methods ---

  // Updates the pixel equivalent for the maximized state
  private updateMaxHeightPx(): void {
    this.heightsPx.maximized = window.innerHeight * 0.75;
  }

  // Returns the target CSS height string based on the current state
  getSheetHeight(): string {
    return this.heights[this.sheetState];
  }

  // Notifies the parent component of the current target height (for layout adjustments)
  private emitHeight(): void {
    this.heightChange.emit(this.getSheetHeight());
  }


  // --- Drag Handling Logic ---

  // Initiates drag state if started on the correct area
  private handleDragStart(clientY: number, target: HTMLElement): void {
      // Check if the target is within the top-bar but NOT the button itself
      const isButton = target.closest('.toggle-button');
      const isTopBar = target.closest('.top-bar');

      if (isTopBar && !isButton) {
          this.isDragging = true;
          this.startY = clientY;
          // Get current actual height from the DOM element
          this.startHeight = this.el.nativeElement.querySelector('.bottom-sheet').offsetHeight;
          // Add class to disable CSS transitions during drag for immediate feedback
          this.renderer.addClass(this.el.nativeElement.querySelector('.bottom-sheet'), 'dragging');
      } else {
          // Reset drag state if starting outside the draggable area
          this.isDragging = false;
          this.startY = null;
          this.startHeight = null;
      }
  }

  // Updates the sheet's height visually during drag
  private handleDragMove(clientY: number): void {
      if (!this.isDragging || this.startY === null || this.startHeight === null) return;

      const deltaY = this.startY - clientY; // How much the finger/mouse moved up
      let newHeight = this.startHeight + deltaY;

      // Clamp the height within reasonable visual bounds during drag
      const minPixelHeight = this.heightsPx.minimized - 20; // Allow slight under-drag
      const maxPixelHeight = window.innerHeight * 0.95; // Limit near full screen height
      newHeight = Math.max(minPixelHeight, Math.min(newHeight, maxPixelHeight));

      // Update the element's style directly for real-time feedback
      this.currentHeight = `${newHeight}px`;
  }

  // Determines the final state and snaps the sheet when drag ends
  private handleDragEnd(): void {
      if (!this.isDragging) return; // Ensure drag was actually active

      this.isDragging = false; // Reset drag flag first
      // Remove dragging class to re-enable CSS transitions for smooth snapping
      this.renderer.removeClass(this.el.nativeElement.querySelector('.bottom-sheet'), 'dragging');

      if (this.startHeight === null) return; // Safety check

      // Get the final height reached during the drag
      const currentActualHeight = this.el.nativeElement.querySelector('.bottom-sheet').offsetHeight;

      // Determine the closest snap state based on final height
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

      // Set the style height to the target state's height to trigger animation
      this.currentHeight = this.getSheetHeight();
      this.emitHeight(); // Notify parent of the final state's height

      // Clean up drag variables
      this.startY = null;
      this.startHeight = null;
      this.removeGlobalMouseListeners(); // Important for mouse events
  }


  // --- Event Listener Bindings ---

  // Touch Events
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.handleDragStart(event.touches[0].clientY, event.target as HTMLElement);
    // Prevent default scrolling only if dragging actually started on the handle area
    if (this.isDragging) {
      event.preventDefault();
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return; // Only process move if dragging
    this.handleDragMove(event.touches[0].clientY);
    event.preventDefault(); // Prevent scrolling while dragging sheet
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.handleDragEnd();
  }
  @HostListener('touchcancel', ['$event'])
  onTouchCancel(event: TouchEvent): void {
    // Treat cancel the same as touchend
    this.handleDragEnd();
  }


   // Mouse Events (for desktop debugging/use)
   @HostListener('mousedown', ['$event'])
   onMouseDown(event: MouseEvent): void {
       this.handleDragStart(event.clientY, event.target as HTMLElement);
       // If drag started, prevent text selection and add global listeners
       if(this.isDragging) {
           event.preventDefault();
           this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.onMouseMove.bind(this));
           this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onMouseUp.bind(this));
       }
   }

   // Bound listener for mouse move (called globally)
   onMouseMove(event: MouseEvent): void {
       if (!this.isDragging) return;
       this.handleDragMove(event.clientY);
       event.preventDefault();
   }

   // Bound listener for mouse up (called globally)
   onMouseUp(event: MouseEvent): void {
       // handleDragEnd checks the isDragging flag and removes listeners
       this.handleDragEnd();
   }

   // Helper to remove global mouse listeners
    private removeGlobalMouseListeners(): void {
        if (this.mouseMoveListener) {
            this.mouseMoveListener(); // Executes the cleanup function returned by renderer.listen
            this.mouseMoveListener = undefined;
        }
        if (this.mouseUpListener) {
            this.mouseUpListener();
            this.mouseUpListener = undefined;
        }
    }
}
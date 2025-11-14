import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menu1SheetContentComponent } from './menu1-sheet-content.component';

describe('Menu1SheetContentComponent', () => {
  let component: Menu1SheetContentComponent;
  let fixture: ComponentFixture<Menu1SheetContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu1SheetContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menu1SheetContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

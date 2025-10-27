import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSheetContentComponent } from './main-sheet-content.component';

describe('MainSheetContentComponent', () => {
  let component: MainSheetContentComponent;
  let fixture: ComponentFixture<MainSheetContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainSheetContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainSheetContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

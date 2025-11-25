import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorApplicationPageComponent } from './vendor-application-page.component';

describe('VendorApplicationPageComponent', () => {
  let component: VendorApplicationPageComponent;
  let fixture: ComponentFixture<VendorApplicationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorApplicationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorApplicationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

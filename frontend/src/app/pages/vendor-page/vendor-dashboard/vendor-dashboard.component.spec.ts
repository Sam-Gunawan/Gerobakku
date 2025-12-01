import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDashboardComponent } from './vendor-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VendorDashboardComponent', () => {
  let component: VendorDashboardComponent;
  let fixture: ComponentFixture<VendorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VendorDashboardComponent,
        HttpClientTestingModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VendorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

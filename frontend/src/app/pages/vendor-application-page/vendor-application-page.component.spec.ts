import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorApplicationPageComponent } from './vendor-application-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VendorApplicationPageComponent', () => {
  let component: VendorApplicationPageComponent;
  let fixture: ComponentFixture<VendorApplicationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VendorApplicationPageComponent,
        HttpClientTestingModule
      ]
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDashboardComponent } from './map-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MapDashboardComponent', () => {
  let component: MapDashboardComponent;
  let fixture: ComponentFixture<MapDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MapDashboardComponent,
        HttpClientTestingModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

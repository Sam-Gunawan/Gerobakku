import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDashboardComponent } from './map-dashboard.component';

describe('MapDashboardComponent', () => {
  let component: MapDashboardComponent;
  let fixture: ComponentFixture<MapDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapDashboardComponent]
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

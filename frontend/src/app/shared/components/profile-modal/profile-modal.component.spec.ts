import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileModalComponent } from './profile-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProfileModalComponent', () => {
  let component: ProfileModalComponent;
  let fixture: ComponentFixture<ProfileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileModalComponent,
        HttpClientTestingModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

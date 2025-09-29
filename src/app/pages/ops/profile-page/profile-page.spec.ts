import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let component: OpsProfilePage;
  let fixture: ComponentFixture<OpsProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsProfilePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpsProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let component: AdminProfilePage;
  let fixture: ComponentFixture<AdminProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

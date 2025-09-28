import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsTopNav } from './ops-top-nav';

describe('OpsTopNav', () => {
  let component: OpsTopNav;
  let fixture: ComponentFixture<OpsTopNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsTopNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpsTopNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

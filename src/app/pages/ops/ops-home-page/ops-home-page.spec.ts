import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsHomePage } from './ops-home-page';

describe('OpsHomePage', () => {
  let component: OpsHomePage;
  let fixture: ComponentFixture<OpsHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsHomePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpsHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

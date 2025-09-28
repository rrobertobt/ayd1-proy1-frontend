import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateOpsLayout } from './private-ops-layout';

describe('PrivateOpsLayout', () => {
  let component: PrivateOpsLayout;
  let fixture: ComponentFixture<PrivateOpsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateOpsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateOpsLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

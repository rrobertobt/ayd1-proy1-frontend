import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesPage } from './deliveries-page';

describe('DeliveriesPage', () => {
  let component: DeliveriesPage;
  let fixture: ComponentFixture<DeliveriesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveriesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

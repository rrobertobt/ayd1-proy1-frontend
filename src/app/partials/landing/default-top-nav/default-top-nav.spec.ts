import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultTopNav } from './default-top-nav';

describe('DefaultTopNav', () => {
  let component: DefaultTopNav;
  let fixture: ComponentFixture<DefaultTopNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultTopNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultTopNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

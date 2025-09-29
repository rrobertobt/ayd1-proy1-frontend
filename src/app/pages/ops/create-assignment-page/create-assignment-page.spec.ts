import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAssignmentPage } from './create-assignment-page';

describe('CreateAssignmentPage', () => {
  let component: CreateAssignmentPage;
  let fixture: ComponentFixture<CreateAssignmentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAssignmentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAssignmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

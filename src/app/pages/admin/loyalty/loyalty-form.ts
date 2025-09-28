import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyLevel } from './loyalty.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './loyalty-form.html',
})
export class LoyaltyForm implements OnInit {
  isEdit = false;
  submitted = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: LoyaltyService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      level_id: [null],
      level_name: ['', Validators.required],
      min_deliveries: [0, [Validators.required, Validators.min(0)]],
      max_deliveries: [null], // nullable
      discount_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      free_cancellations: [0, [Validators.required, Validators.min(0)]],
      penalty_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      active: [true],
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit) {
      this.api.get(+id!).subscribe(l => {
        if (!l) return;
        this.form.patchValue(l);
        this.form.get('level_name')?.disable(); // unique in DB
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: LoyaltyLevel = { ...this.form.getRawValue() };
    const op$ = this.isEdit ? this.api.update(payload) : this.api.create(payload);
    op$.subscribe(() => this.router.navigate(['/admin/loyalty']));
  }

  back() { this.router.navigate(['/admin/loyalty']); }
}

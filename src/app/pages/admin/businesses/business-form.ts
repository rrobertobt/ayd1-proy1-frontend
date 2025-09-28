import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BusinessesService } from './businesses.service';
import { Business, LoyaltyLevelRef } from './business.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './business-form.html',
})
export class BusinessForm implements OnInit, OnDestroy {
  isEdit = false;
  submitted = false;

  loading = false;
  errorMsg = '';
  saving = false;

  levels: LoyaltyLevelRef[] = [];
  form!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: BusinessesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      business_id: [null],

      // Owner (POST only)
      email: ['',[Validators.email]],
      first_name: [''],
      last_name: [''],
      phone: [''],
      address: [''],
      national_id: [''],

      // Commerce
      tax_id: ['', Validators.required],         // read-only on edit
      business_name: ['', Validators.required],
      legal_name: ['', Validators.required],
      tax_address: ['', Validators.required],
      business_phone: [''],
      business_email: ['', Validators.email],
      support_contact: [''],
      active: [true],
      affiliation_date: ['', Validators.required], // used on create

      // Loyalty
      initial_level_id: [null],                  // create only
      current_level_id: [null],                  // read/display only
    });

    this.api.listLevels().pipe(takeUntil(this.destroy$)).subscribe(l => {
      this.levels = l;
      this.cdr.detectChanges();
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(pm => {
      const id = pm.get('id');
      this.isEdit = !!id;

      if (!this.isEdit) {
        this.loading = false;
        this.form.get('tax_id')?.enable();
        this.form.get('initial_level_id')?.enable();
        this.form.get('email')?.setValidators([Validators.email]);
        this.cdr.detectChanges();
        return;
      }

      this.loading = true;
      this.form.get('tax_id')?.disable();
      this.form.get('initial_level_id')?.disable();
      this.cdr.detectChanges();

      this.api.get(Number(id))
        .pipe(
          finalize(() => { this.loading = false; this.cdr.detectChanges(); }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (b: Business) => {
            this.form.patchValue(b);
            // owner fields are not editable on PUT; leave them as shown if backend returns them
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar el comercio';
            this.cdr.detectChanges();
          },
        });
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.saving = true;
    const payload: Business = { ...this.form.getRawValue() };

    const req$ = this.isEdit
      ? this.api.update(payload)
      : this.api.create(payload);

    req$
      .pipe(
        finalize(() => { this.saving = false; this.cdr.detectChanges(); }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.router.navigate(['/admin/businesses']),
        error: (err) => {
          this.errorMsg = err?.error?.message || err?.message || 'No se pudo guardar el comercio';
          this.cdr.detectChanges();
        },
      });
  }

  back(): void {
    this.router.navigate(['/admin/businesses']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

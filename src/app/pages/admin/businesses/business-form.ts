import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
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
  saveError = '';

  inactiveLocked = false;       // lock form if business is inactive
  originalActive = true;        // current active from server

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
      email: ['', [Validators.email]],
      first_name: [''],
      last_name: [''],
      phone: [''],
      address: [''],
      national_id: [''],

      // Commerce
      tax_id: ['', Validators.required],
      business_name: ['', Validators.required],
      legal_name: ['', Validators.required],
      tax_address: ['', Validators.required],
      business_phone: [''],
      business_email: ['', Validators.email],
      support_contact: [''],
      active: [true],
      affiliation_date: ['', Validators.required],   // only for create

      // Loyalty
      initial_level_id: [null],      // create only
      current_level_id: [null],      // read/display
    });

    this.api.listLevels()
      .pipe(takeUntil(this.destroy$))
      .subscribe(l => { this.levels = l; this.cdr.detectChanges(); });

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(pm => {
        const id = pm.get('id');
        this.isEdit = !!id;
        this.errorMsg = '';
        this.inactiveLocked = false;
        this.originalActive = true;

        if (!this.isEdit) {
          this.form.enable();
          this.form.get('tax_id')?.enable();
          this.form.get('initial_level_id')?.enable();
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
              const activeBool = b.active === true;
              this.originalActive = activeBool;
              this.form.patchValue({ ...b, active: activeBool });
              if (!activeBool) {
                this.inactiveLocked = true;
                this.form.disable();
              } else {
                this.form.enable();
                this.form.get('tax_id')?.disable();
                this.form.get('initial_level_id')?.disable();
              }
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar el comercio';
              this.cdr.detectChanges();
            },
          });
      });
  }

  activate(): void {
    const id = this.form.get('business_id')?.value as number | null;
    if (!id) return;

    this.saving = true;
    this.cdr.detectChanges();

    this.api.setStatus(id, true)
      .pipe(
        finalize(() => { this.saving = false; this.cdr.detectChanges(); }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.inactiveLocked = false;
          this.originalActive = true;
          this.form.enable();
          this.form.get('tax_id')?.disable();
          this.form.get('initial_level_id')?.disable();
          this.form.get('active')?.setValue(true);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saveError = err?.error?.message || err?.message || 'No se pudo activar el comercio';
          this.cdr.detectChanges();
        },
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.saveError = '';
    if (this.form.invalid || this.inactiveLocked) return;

    this.saving = true;
    this.cdr.detectChanges();

    const payload: Business = { ...this.form.getRawValue() };
    const desiredActive = !!payload.active;

    const put$ = this.isEdit ? this.api.update(payload) : this.api.create(payload);

    put$
      .pipe(
        switchMap((saved) => {
          if (this.isEdit && this.originalActive && !desiredActive && saved?.business_id) {
            return this.api.setStatus(saved.business_id, false).pipe(switchMap(() => of(saved)));
          }
          return of(saved);
        }),
        finalize(() => { this.saving = false; this.cdr.detectChanges(); }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.router.navigate(['/admin/businesses']),
        error: (err) => {
          this.saveError = err?.error?.message || err?.message || 'No se pudo guardar el comercio';
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

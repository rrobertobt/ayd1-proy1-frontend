import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyLevel } from './loyalty.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './loyalty-form.html',
})
export class LoyaltyForm implements OnInit, OnDestroy {
  isEdit = false;
  submitted = false;

  loading = false;
  saving = false;
  errorMsg = '';
  saveError = '';

  isInactive = false;          // controls blur/lock state
  private origActive = true;   // original active flag for “update then deactivate”

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: LoyaltyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      level_id: [null],
      level_name: ['', Validators.required],              // read-only on edit
      min_deliveries: [0, [Validators.required, Validators.min(0)]],
      max_deliveries: [null],
      discount_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      free_cancellations: [0, [Validators.required, Validators.min(0)]],
      penalty_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      active: [true, Validators.required],
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(pm => {
      const id = pm.get('id');
      this.isEdit = !!id;

      if (!this.isEdit) {
        // create flow (if ever used): everything enabled
        this.isInactive = false;
        this.cdr.detectChanges();
        return;
      }

      this.loading = true;
      this.cdr.detectChanges();

      this.api.get(Number(id))
        .pipe(
          finalize(() => { this.loading = false; this.cdr.detectChanges(); }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (lvl) => {
            this.form.patchValue(lvl);
            this.origActive = !!lvl.active;
            this.isInactive = !lvl.active;

            // level_name is immutable on edit
            this.form.get('level_name')?.disable({ emitEvent: false });

            if (this.isInactive) {
              this.form.disable({ emitEvent: false });
            } else {
              this.form.enable({ emitEvent: false });
              this.form.get('level_name')?.disable({ emitEvent: false });
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar el nivel';
            this.cdr.detectChanges();
          },
        });
    });
  }

  activate(): void {
    const id = this.form.get('level_id')?.value as number | null;
    if (!id) return;

    this.saving = true;
    this.cdr.detectChanges();

    this.api.setStatus(id, true)
      .pipe(finalize(() => { this.saving = false; this.cdr.detectChanges(); }))
      .subscribe(() => {
        this.isInactive = false;
        this.origActive = true;
        this.form.enable({ emitEvent: false });
        this.form.get('level_name')?.disable({ emitEvent: false });
        this.form.get('active')?.setValue(true, { emitEvent: false });
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.saveError = '';
    if (this.form.invalid || this.isInactive) return;

    this.saving = true;
    this.cdr.detectChanges();

    const raw = this.form.getRawValue() as LoyaltyLevel;
    const id = raw.level_id!;
    const wantsActive = !!raw.active;

    // If originally active and user wants it inactive, first PUT then PATCH(false)
    const shouldDeactivateAfter = this.isEdit && this.origActive && !wantsActive;

    const updatePayload: LoyaltyLevel = {
      ...raw,
      active: shouldDeactivateAfter ? true : wantsActive
    };

    this.api.update(updatePayload)
      .pipe(finalize(() => { this.saving = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          if (shouldDeactivateAfter) {
            this.api.setStatus(id, false).subscribe(() => this.router.navigate(['/admin/loyalty']));
          } else {
            this.router.navigate(['/admin/loyalty']);
          }
        },
        error: (err) => {
          this.saveError = err?.error?.message || err?.message || 'No se pudo guardar el nivel';
          this.cdr.detectChanges();
        },
      });
  }

  back(): void {
    this.router.navigate(['/admin/loyalty']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

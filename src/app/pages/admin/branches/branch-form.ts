import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { BranchesService } from './branches.service';
import { Branch } from './branch.model';
import { ChangeDetectorRef } from '@angular/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './branch-form.html',
})
export class BranchForm implements OnInit, OnDestroy {
  isEdit = false;
  submitted = false;

  loading = false;
  errorMsg = '';
  saving = false;
  saveError = '';

  form!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: BranchesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      branch_id: [null],
      branch_code: ['', Validators.required],
      branch_name: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email],
      city: [''],
      state: [''],
      active: [true],
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((pm) => {
      const id = pm.get('id');
      this.isEdit = !!id;

      this.errorMsg = '';
      if (!this.isEdit) {
        this.loading = false;
        this.form.reset({
          branch_id: null,
          branch_code: '',
          branch_name: '',
          address: '',
          phone: '',
          email: '',
          city: '',
          state: '',
          active: true,
        });
        this.cdr.detectChanges();
        return;
      }

      this.loading = true;
      this.cdr.detectChanges();

      this.api
        .get(Number(id))
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (b) => {
            this.form.patchValue(b);
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar la sucursal';
            this.cdr.detectChanges();
          },
        });
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.saveError = '';
    if (this.form.invalid) return;

    this.saving = true;
    this.cdr.detectChanges();

    const payload: Branch = { ...this.form.getRawValue() };

    const op$ = this.isEdit ? this.api.update(payload) : this.api.create(payload);

    op$
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.router.navigate(['/admin/branches']),
        error: (err) => {
          this.saveError = err?.error?.message || err?.message || 'No se pudo guardar la sucursal';
          this.cdr.detectChanges();
        },
      });
  }

  back(): void {
    this.router.navigate(['/admin/branches']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

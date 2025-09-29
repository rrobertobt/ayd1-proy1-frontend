import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UsersService } from './users.service';
import { CreateUserPayload, RoleRef, UpdateUserPayload, User } from './user.types';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './user-form.html',
})
export class UserForm implements OnInit, OnDestroy {
  isEdit = false;
  submitted = false;
  loading = false;
  saving = false;
  errorMsg = '';
  saveError = '';
  form!: FormGroup;
  roles: RoleRef[] = [];
  private originalActive = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: UsersService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      user_id: [null],
      role_id: [3, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: [''],
      address: [''],
      national_id: [''],
      two_factor_enabled: [false],
      active: [true],
      temporary_password: [''],
    });

    this.api.listRoles().subscribe(r => { this.roles = r; this.cdr.detectChanges(); });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(pm => {
      const id = pm.get('id');
      this.isEdit = !!id;
      this.errorMsg = '';

      if (!this.isEdit) {
        this.originalActive = true;
        this.form.get('temporary_password')?.setValidators([Validators.required]);
        this.form.get('temporary_password')?.updateValueAndValidity({ emitEvent: false });
        this.cdr.detectChanges();
        return;
      }

      this.loading = true;
      this.form.get('temporary_password')?.clearValidators();
      this.form.get('temporary_password')?.updateValueAndValidity({ emitEvent: false });
      this.cdr.detectChanges();

      this.api.get(Number(id)).subscribe({
        next: (u: User) => {
          this.originalActive = u.active;
          this.form.patchValue({ ...u, temporary_password: '' });
          this.updateBlurState();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar el usuario';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    });
  }

  get isReactivateMode(): boolean {
    return this.isEdit && this.originalActive === false;
  }

  private updateBlurState() {
    const disable = this.isReactivateMode;
    // Keep `active` enabled so it can be toggled even when user is deactivated
    const keys = [
      'email',
      'role_id',
      'first_name',
      'last_name',
      'phone',
      'address',
      'national_id',
      'two_factor_enabled',
      // 'active'  <-- do NOT disable this one
    ];
    keys.forEach(k => (disable ? this.form.get(k)?.disable({ emitEvent: false })
                               : this.form.get(k)?.enable({ emitEvent: false })));
  }

  reactivate() {
    const id = this.form.get('user_id')?.value as number;
    if (!id) return;
    this.saving = true;
    this.api.setStatus(id, true).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/admin/users']); },
      error: () => { this.saving = false; },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.saveError = '';
    if (this.form.invalid) return;

    if (this.isEdit) {
      const raw = this.form.getRawValue() as User & { temporary_password?: string };
      const payload: UpdateUserPayload = {
        user_id: raw.user_id as number,
        role_id: raw.role_id,
        email: raw.email,
        first_name: raw.first_name,
        last_name: raw.last_name,
        phone: raw.phone ?? null,
        address: raw.address ?? null,
        national_id: raw.national_id ?? null,
        two_factor_enabled: !!raw.two_factor_enabled,
      };
      const targetActive = !!raw.active;

      this.saving = true;
      this.api.update(payload).subscribe({
        next: () => {
          this.saving = false;
          if (this.originalActive !== targetActive) {
            this.api.setStatus(payload.user_id, targetActive).subscribe(() => this.router.navigate(['/admin/users']));
          } else {
            this.router.navigate(['/admin/users']);
          }
        },
        error: (err) => { this.saving = false; this.saveError = err?.error?.message || err?.message || 'No se pudo guardar.'; },
      });
      return;
    }

    const createBody: CreateUserPayload = this.form.getRawValue() as CreateUserPayload;
    this.saving = true;
    this.api.create(createBody).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/admin/users']); },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || err?.message || 'No se pudo crear.'; },
    });
  }

  back(): void { this.router.navigate(['/admin/users']); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}

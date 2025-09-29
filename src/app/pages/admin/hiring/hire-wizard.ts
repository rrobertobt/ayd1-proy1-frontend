import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { UsersService } from '../users/users.service';
import { RoleRef, CreateUserPayload } from '../users/user.types';
import { ContractsService } from '../contracts/contracts.service';
import { ContractTypeRef, Contract } from '../contracts/contract.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './hire-wizard.html',
})
export class HireWizard {
  step = 1;
  roles: RoleRef[] = [];
  types: ContractTypeRef[] = [];
  userForm!: FormGroup;
  contractForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private contracts: ContractsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.userForm = this.fb.group({
      role_id: [3, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: [''],
      address: [''],
      national_id: [''],
      two_factor_enabled: [false],
      active: [true],
      temporary_password: ['', Validators.required],
    });

    this.contractForm = this.fb.group({
      contract_type_id: [null, Validators.required],
      base_salary: [0],
      commission_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      start_date: ['', Validators.required],
      end_date: [null],
      observations: [''],
    });

    this.users.listRoles().subscribe(r => { this.roles = r; this.cdr.detectChanges(); });
    this.contracts.listTypes().subscribe(t => { this.types = t; this.cdr.detectChanges(); });
  }

  next() {
    if (this.step === 1 && this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.step = 2;
  }
  back() { if (this.step === 2) this.step = 1; }
  cancel() { this.router.navigate(['/admin/users']); }

  submit() {
    if (this.userForm.invalid || this.contractForm.invalid) {
      this.userForm.markAllAsTouched();
      this.contractForm.markAllAsTouched();
      return;
    }

    const userPayload = this.userForm.getRawValue() as CreateUserPayload;

    this.users.create(userPayload).subscribe(newUser => {
      const f = this.contractForm.getRawValue();
      const payload: Contract = {
        user_id: newUser.user_id!,
        contract_type_id: f.contract_type_id,
        base_salary: f.base_salary ?? 0,
        commission_percentage: f.commission_percentage,
        start_date: f.start_date,
        end_date: f.end_date ?? null,
        observations: f.observations ?? '',
        active: true,
      };
      this.contracts.create(payload).subscribe(() => this.router.navigate(['/admin/users']));
    });
  }
}

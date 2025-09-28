import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { UsersService } from '../users/users.service';
import { ContractsService } from '../contracts/contracts.service';
import { RoleRef } from '../users/user.model';
import { ContractTypeRef } from '../contracts/contract.model';

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
    private router: Router
  ) {
    this.userForm = this.fb.group({
      role_id: [3, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: [''],
      address: [''],
      national_id: [''],
      active: [true],
      two_factor_enabled: [false],
    });

    this.contractForm = this.fb.group({
      contract_type_id: [1, Validators.required],
      base_salary: [0],
      commission_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      start_date: ['', Validators.required],
      end_date: [null],
      observations: [''],
    });

    this.users.listRoles().subscribe((r) => (this.roles = r));
    this.contracts.listTypes().subscribe((t) => (this.types = t));
  }

  next() {
    if (this.step === 1 && this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.step = 2;
  }

  back() {
    if (this.step === 2) this.step = 1;
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }

  submit() {
    if (this.userForm.invalid || this.contractForm.invalid) {
      this.userForm.markAllAsTouched();
      this.contractForm.markAllAsTouched();
      return;
    }
    this.users.create(this.userForm.getRawValue()).subscribe((newUser) => {
      const payload = {
        user_id: newUser.user_id!,
        admin_id: 1,
        active: true,
        ...this.contractForm.getRawValue(),
      };
      this.contracts.create(payload).subscribe(() => {
        this.router.navigate(['/admin/users']);
      });
    });
  }
}

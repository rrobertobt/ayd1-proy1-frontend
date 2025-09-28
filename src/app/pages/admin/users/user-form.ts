import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { UsersService } from './users.service';
import { User, RoleRef } from './user.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './user-form.html',
})
export class UserForm implements OnInit {
  isEdit = false;
  submitted = false;
  form!: FormGroup;
  roles: RoleRef[] = [];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private api: UsersService) {}

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
      active: [true],
      two_factor_enabled: [false],
    });

    this.api.listRoles().subscribe(r => this.roles = r);

    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    if (this.isEdit) {
      this.api.get(+id!).subscribe(u => { if (!u) return; this.form.patchValue(u); });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    const payload: User = { ...this.form.getRawValue() };
    const op$ = this.isEdit ? this.api.update(payload) : this.api.create(payload);
    op$.subscribe(() => this.router.navigate(['/admin/users']));
  }

  back() { this.router.navigate(['/admin/users']); }
}

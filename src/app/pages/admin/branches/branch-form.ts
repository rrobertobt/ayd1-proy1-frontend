import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { BranchesService } from './branches.service';
import { Branch } from './branch.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './branch-form.html',
  styles: [`
    .input { @apply w-full rounded border px-3 py-2 bg-white outline-none focus:ring-2 ring-indigo-200; }
  `]
})
export class BranchForm implements OnInit {
  isEdit = false;
  submitted = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: BranchesService
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

    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit) {
      this.api.get(+id!).subscribe(b => {
        if (!b) return;
        this.form.patchValue(b);
        this.form.get('branch_code')?.disable(); // único, no editable
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: Branch = { ...this.form.getRawValue() };
    const op$ = this.isEdit ? this.api.update(payload) : this.api.create(payload);

    op$.subscribe(() => this.router.navigate(['/admin/branches']));
  }

  back() { this.router.navigate(['/admin/branches']); }
}

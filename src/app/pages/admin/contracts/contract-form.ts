import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ContractsService } from './contracts.service';
import { Contract, ContractTypeRef } from './contract.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './contract-form.html',
})
export class ContractForm implements OnInit {
  isEdit = false;
  submitted = false;
  form!: FormGroup;
  types: ContractTypeRef[] = [];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private api: ContractsService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      contract_id: [null],
      user_id: [null, Validators.required],
      admin_id: [1, Validators.required],
      contract_type_id: [1, Validators.required],
      base_salary: [0],
      commission_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      start_date: ['', Validators.required],
      end_date: [null],
      active: [true],
      observations: [''],
    });

    this.api.listTypes().subscribe(t => this.types = t);

    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    if (this.isEdit) {
      this.api.get(+id!).subscribe(c => { if (!c) return; this.form.patchValue(c); });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    const payload: Contract = { ...this.form.getRawValue() };
    const op$ = this.isEdit ? this.api.update(payload) : this.api.create(payload);
    op$.subscribe(() => this.router.navigate(['/admin/contracts']));
  }

  back() { this.router.navigate(['/admin/contracts']); }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { BusinessesService } from './businesses.service';
import { Business, LoyaltyLevelRef } from './business.model';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './business-form.html',
})
export class BusinessForm implements OnInit {
  isEdit = false;
  submitted = false;
  form!: FormGroup;
  levels: LoyaltyLevelRef[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: BusinessesService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      business_id: [null],
      user_id: [null, Validators.required],           
      current_level_id: [null],                        
      tax_id: ['', Validators.required],
      business_name: ['', Validators.required],
      legal_name: ['', Validators.required],
      tax_address: ['', Validators.required],
      business_phone: [''],
      business_email: ['', Validators.email],
      support_contact: [''],
      active: [true],
      affiliation_date: ['', Validators.required],    
    });


    this.api.listLevels().subscribe(l => this.levels = l);

    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit) {
      this.api.get(+id!).subscribe(b => {
        if (!b) return;
        this.form.patchValue(b);
        this.form.get('tax_id')?.disable(); 
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: Business = { ...this.form.getRawValue() }; 
    const op$ = this.isEdit ? this.api.update(payload) : this.api.create(payload);

    op$.subscribe(() => this.router.navigate(['/admin/businesses']));
  }

  back() { this.router.navigate(['/admin/businesses']); }
}

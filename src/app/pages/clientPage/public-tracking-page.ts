import { Component, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { PublicTrackingService, TrackingInfo } from './public-tracking.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './public-tracking-page.html',
})
export class PublicTrackingPage {
  form: FormGroup;
  rejectForm: FormGroup;

  loading = false;
  errorMsg = '';
  info?: TrackingInfo;

  constructor(
    private fb: FormBuilder,
    private api: PublicTrackingService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      guideNumber: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.rejectForm = this.fb.group({
      user_email: ['', [Validators.required, Validators.email]],
      rejection_reason: ['', [Validators.required, Validators.minLength(5)]],
      requires_return: [true],
    });
  }

  search(): void {
    this.errorMsg = '';
    this.info = undefined;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { guideNumber } = this.form.getRawValue();
    const trimmed = String(guideNumber || '').trim();
    if (!trimmed) return;

    this.loading = true;

    this.api.getOne(trimmed).subscribe({
      next: (data) => {
        this.info = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.message || 'No se encontró la guía.';
        this.cdr.detectChanges();
      },
    });
  }

  sendReject(): void {
    if (!this.info?.guide_number || !this.info.can_reject) return;

    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }

    const body = {
      guide_number: this.info.guide_number,
      ...this.rejectForm.getRawValue(),
    };

    this.api.reject(body).subscribe({
      next: () => {
        alert('Se registró el rechazo. Te contactaremos con los pasos de devolución.');
        this.rejectForm.reset({
          user_email: '',
          rejection_reason: '',
          requires_return: true,
        });
      },
      error: (err) => {
        alert(err?.error?.message || err?.message || 'No se pudo registrar el rechazo.');
      },
    });
  }
}

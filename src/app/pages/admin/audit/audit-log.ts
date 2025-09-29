import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf, JsonPipe } from '@angular/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogEntry } from './audit-log.types';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, JsonPipe],
  templateUrl: './audit-log.html',
})
export class AuditLog implements OnInit {
  form!: FormGroup;
  loading = false;
  errorMsg = '';
  items: AuditLogEntry[] = [];

  tableNames = [
    'users','roles','contracts','contract_types','branches','businesses',
    'tracking_guides','state_history','notifications','cancellations',
    'delivery_incidents','delivery_evidence','courier_settlements',
    'settlement_details','loyalty_levels','monthly_discounts','system_config','audit_log'
  ];

  constructor(private fb: FormBuilder, private api: AuditLogService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      tableName: [''],
      userId: [''],
      startDate: [''],
      endDate: [''],
    });
    this.fetch();
  }

  opName(opId: number): string {
    return opId === 1 ? 'INSERT' : opId === 2 ? 'UPDATE' : opId === 3 ? 'DELETE' : String(opId);
  }

  fetch(): void {
    this.loading = true;
    this.errorMsg = '';

    const { tableName, userId, startDate, endDate } = this.form.getRawValue();
    const payload = {
      tableName: tableName || undefined,
      userId: userId ? Number(userId) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    this.api.list(payload).subscribe({
      next: (rows) => {
        this.items = rows;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar el audit log.';
        this.cdr.detectChanges();
      },
    });
  }

  clear(): void {
    this.form.reset({ tableName: '', userId: '', startDate: '', endDate: '' });
    this.fetch();
  }
}

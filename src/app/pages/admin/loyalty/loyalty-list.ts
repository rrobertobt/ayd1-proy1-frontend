import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyLevel } from './loyalty.model';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './loyalty-list.html',
})
export class LoyaltyList implements OnInit {
  loading = false;
  errorMsg = '';
  items: LoyaltyLevel[] = [];

  constructor(private api: LoyaltyService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.fetch(); }

  fetch(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.list().subscribe({
      next: rows => {
        this.items = rows;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err?.message || 'No se pudieron cargar los niveles.';
        this.cdr.detectChanges();
      },
    });
  }

  toggleActive(l: LoyaltyLevel): void {
    if (!l.level_id) return;
    const next = !l.active;
    this.api.setStatus(l.level_id, next).subscribe({
      next: () => this.fetch(),
    });
  }
}

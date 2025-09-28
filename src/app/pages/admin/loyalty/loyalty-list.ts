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

  ngOnInit(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (rows) => {
        this.items = rows;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load loyalty levels.';
      },
    });
  }

  toggleActive(l: LoyaltyLevel) {
    this.api.update({ ...l, active: !l.active }).subscribe(val => {
      const i = this.items.findIndex(x => x.level_id === val.level_id);
      if (i > -1) this.items[i] = val;
      this.items = [...this.items];
      this.cdr.detectChanges();
    });
  }

  delete(id?: number) {
    if (!id) return;
    this.api.remove(id).subscribe(() => {
      this.items = this.items.filter(x => x.level_id !== id);
      this.cdr.detectChanges();
    });
  }
}

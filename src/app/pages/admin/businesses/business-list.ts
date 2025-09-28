import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { BusinessesService } from './businesses.service';
import { Business, LoyaltyLevelRef } from './business.model';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './business-list.html',
})
export class BusinessList implements OnInit {
  loading = false;
  errorMsg = '';
  items: Business[] = [];
  levelsById = new Map<number, string>();

  constructor(private api: BusinessesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.listLevels().subscribe((lvls: LoyaltyLevelRef[]) => {
      this.levelsById = new Map(lvls.map(l => [l.level_id, l.level_name]));
    });

    this.api.list().subscribe({
      next: (rows) => {
        this.items = rows;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudieron cargar los comercios.';
      },
    });
  }

  levelName(id?: number | null) {
    if (!id) return '-';
    return this.levelsById.get(id) || '-';
  }

  toggleActive(b: Business) {
    this.api.update({ ...b, active: !b.active }).subscribe(val => {
      const i = this.items.findIndex(x => x.business_id === val.business_id);
      if (i > -1) this.items[i] = val;
      this.items = [...this.items];
      this.cdr.detectChanges();
    });
  }

  delete(id?: number) {
    if (!id) return;
    this.api.remove(id).subscribe(() => {
      this.items = this.items.filter(b => b.business_id !== id);
      this.cdr.detectChanges();
    });
  }
}

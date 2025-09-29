import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BusinessesService } from './businesses.service';
import { Business, LoyaltyLevelRef } from './business.model';
import { ConfirmService } from '../../../shared/confirm/confirm.service';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, AsyncPipe],
  templateUrl: './business-list.html',
})
export class BusinessList implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  errorMsg = '';
  items: Business[] = [];
  levelsById = new Map<number, string>();

  constructor(
    private api: BusinessesService,
    private confirm: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading$.next(true);
    this.errorMsg = '';

    this.api.listLevels().subscribe({
      next: (lvls: LoyaltyLevelRef[]) => {
        this.levelsById = new Map(lvls.map(l => [l.level_id, l.level_name]));
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.api
      .list()
      .pipe(
        finalize(() => {
          this.loading$.next(false);
          this.cdr.detectChanges();
        }),
        catchError(err => {
          this.errorMsg = err?.message || 'No se pudieron cargar los comercios.';
          return of<Business[]>([]);
        })
      )
      .subscribe(rows => {
        this.items = rows;
        this.cdr.detectChanges();
      });
  }

  trackById = (_: number, b: Business) => b.business_id ?? -1;

  levelName(id?: number | null) {
    if (!id) return '-';
    return this.levelsById.get(id) || '-';
  }

  toggleActive(b: Business) {
    if (!b.business_id) return;
    const next = !b.active;
    this.api.setStatus(b.business_id, next).subscribe({
      next: () => this.fetch(),
    });
  }

  async delete(id?: number) {
    if (!id) return;
    const ok = await this.confirm.open({
      title: 'Eliminar comercio',
      message: 'Esta acción no se puede deshacer. ¿Seguro que deseas continuar?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    this.api.remove(id).subscribe({
      next: () => this.fetch(),
    });
  }
}

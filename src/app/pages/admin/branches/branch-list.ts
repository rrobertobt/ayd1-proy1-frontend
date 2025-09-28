import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BranchesService } from './branches.service';
import { Branch } from './branch.model';
import { ConfirmService } from '../../../shared/confirm/confirm.service';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, AsyncPipe],
  templateUrl: './branch-list.html',
})
export class BranchList implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  errorMsg = '';
  branches: Branch[] = [];

  constructor(private api: BranchesService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading$.next(true);
    this.errorMsg = '';

    this.api
      .list()
      .pipe(
        finalize(() => this.loading$.next(false)),
        catchError(err => {
          this.errorMsg = err?.message || 'Error cargando sucursales';
          return of<Branch[]>([]);
        })
      )
      .subscribe(bs => (this.branches = bs));
  }

  trackById = (_: number, b: Branch) => b.branch_id ?? -1;

  toggleActive(b: Branch): void {
    if (!b.branch_id) return;
    const next = !b.active;
    this.api.setStatus(b.branch_id, next).subscribe({
      next: () => this.fetch(),
    });
  }

  async delete(id?: number): Promise<void> {
    if (!id) return;
    const ok = await this.confirm.open({
      title: 'Eliminar sucursal',
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

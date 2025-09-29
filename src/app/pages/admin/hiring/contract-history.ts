import { ConfirmService } from '../../../shared/confirm/confirm.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { of } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { ContractsService } from '../contracts/contracts.service';
import { UsersService } from '../users/users.service';
import { Contract, ContractTypeRef } from '../contracts/contract.model';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './contract-history.html',
})
export class ContractHistory implements OnInit {
  userId!: number;
  userName = '';
  items: Contract[] = [];
  types = new Map<number, string>();
  loading = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private api: ContractsService,
    private users: UsersService,
    private confirm: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = +(this.route.snapshot.paramMap.get('id') || 0);

    this.users.get(this.userId).subscribe({
      next: u => { if (u) this.userName = `${u.first_name} ${u.last_name}`.trim(); this.cdr.detectChanges(); },
      error: () => {},
    });

    this.api.listTypes().subscribe({
      next: (t: ContractTypeRef[]) => { this.types = new Map(t.map(x => [x.contract_type_id, x.type_name])); this.cdr.detectChanges(); },
      error: () => {},
    });

    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.errorMsg = '';
    this.api.listByUser(this.userId).subscribe({
      next: rows => {
        this.items = (rows || []).slice().sort((a, b) => (a.start_date > b.start_date ? -1 : 1));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar el historial.';
        this.cdr.detectChanges();
      }
    });
  }

  typeName(id: number) { return this.types.get(id) || '-'; }

  async renew(c: Contract) {
    const ok = await this.confirm.open({
      title: 'Renovar contrato',
      message: 'Se creará un nuevo contrato con fecha de inicio hoy.',
      confirmText: 'Renovar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    const today = new Date().toISOString().slice(0, 10);
    const payload: Contract = {
      user_id: c.user_id,
      contract_type_id: c.contract_type_id,
      base_salary: c.base_salary ?? 0,
      commission_percentage: c.commission_percentage,
      start_date: today,
      end_date: null,
      observations: 'Renovación',
      active: true,
    };
    this.api.create(payload).subscribe(() => this.refresh());
  }

  async terminate(c: Contract) {
    const ok = await this.confirm.open({
      title: 'Dar de baja contrato',
      message: 'Se pondrá inactivo y se intentará fijar fecha de fin en hoy.',
      confirmText: 'Continuar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    const today = new Date().toISOString().slice(0, 10);

    this.loading = true;
    // 1) status=false SIEMPRE
    this.api.setStatus(c.contract_id!, false)
      .pipe(
        // 2) intentar terminate, pero no bloquear si falla
        switchMap(() => this.api.terminate(c.contract_id!, today).pipe(catchError(() => of(void 0)))),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: () => this.refresh(),
        error: () => this.refresh(),
      });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ContractsService } from './contracts.service';
import { Contract, ContractTypeRef } from './contract.model';
import { ConfirmService } from '../../../shared/confirm/confirm.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.types';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './contract-list.html',
})
export class ContractList implements OnInit {
  loading = false;
  errorMsg = '';
  items: Contract[] = [];
  types = new Map<number, string>();
  userNames = new Map<number, string>();

  constructor(
    private api: ContractsService,
    private users: UsersService,
    private cdr: ChangeDetectorRef,
    private confirm: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.api.listTypes().subscribe({
      next: (t: ContractTypeRef[]) => {
        this.types = new Map(t.map(x => [x.contract_type_id, x.type_name]));
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.api.list().subscribe({
      next: rows => {
        this.items = rows;
        this.loading = false;

        // Load users and cache names for display
        this.users.list().subscribe({
          next: (us: User[]) => {
            for (const u of us) if (u.user_id) this.userNames.set(u.user_id, `${u.first_name} ${u.last_name}`.trim());
            this.cdr.detectChanges();
          },
          error: () => {},
        });

        this.cdr.detectChanges();
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.message || 'Failed to load contracts.';
        this.cdr.detectChanges();
      }
    });
  }

  typeName(id: number) { return this.types.get(id) || '-'; }
  userName(id: number) { return this.userNames.get(id) || '-'; }

  async delete(id?: number) {
    if (!id) return;
    const ok = await this.confirm.open({
      title: 'Eliminar contrato',
      message: 'Esta acción no se puede deshacer. ¿Seguro que deseas continuar?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    this.api.remove(id).subscribe({
      next: () => { this.items = this.items.filter(x => x.contract_id !== id); this.cdr.detectChanges(); },
    });
  }
}

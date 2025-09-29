import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { UsersService } from './users.service';
import { User, RoleRef } from './user.types';
import { ConfirmService } from '../../../shared/confirm/confirm.service';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './user-list.html',
})
export class UserList implements OnInit {
  loading = false;
  errorMsg = '';
  items: User[] = [];
  roles = new Map<number, string>();

  constructor(
    private api: UsersService,
    private cdr: ChangeDetectorRef,
    private confirm: ConfirmService 
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.listRoles().subscribe(r => {
      this.roles = new Map(r.map(x => [x.role_id, x.role_name]));
      this.cdr.detectChanges();
    });
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: rows => {
        this.items = rows;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load users.';
        this.cdr.detectChanges();
      }
    });
  }

  roleName(id: number) {
    return this.roles.get(id) || '-';
  }

  toggleActive(u: User) {
  if (!u.user_id) return;
  const next = !u.active;
  this.api.setStatus(u.user_id, next).subscribe({
    next: () => this.fetch(),
  });
}


  async delete(id?: number): Promise<void> {
    if (!id) return;
    const ok = await this.confirm.open({
      title: 'Eliminar usuario',
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

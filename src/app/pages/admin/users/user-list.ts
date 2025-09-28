import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { UsersService } from './users.service';
import { User, RoleRef } from './user.model';

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

  constructor(private api: UsersService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.listRoles().subscribe(rs => this.roles = new Map(rs.map(r => [r.role_id, r.role_name])));
    this.api.list().subscribe({
      next: rows => { this.items = rows; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load users.'; }
    });
  }

  roleName(id: number) { return this.roles.get(id) || '-'; }

  toggleActive(u: User) {
    this.api.update({ ...u, active: !u.active }).subscribe(val => {
      const i = this.items.findIndex(x => x.user_id === val.user_id);
      if (i > -1) this.items[i] = val;
      this.items = [...this.items]; this.cdr.detectChanges();
    });
  }

  delete(id?: number) {
    if (!id) return;
    this.api.remove(id).subscribe(() => {
      this.items = this.items.filter(x => x.user_id !== id);
      this.cdr.detectChanges();
    });
  }
}

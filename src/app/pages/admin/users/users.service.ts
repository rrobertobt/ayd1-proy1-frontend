import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import { CreateUserPayload, UpdateUserPayload, User, RoleRef } from './user.types';

type UserListResponse =
  | User[]
  | { data: any[]; total?: number; page?: number; pageSize?: number }
  | { content: any[]; totalElements?: number; totalPages?: number; number?: number; size?: number };

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly base = '/admin/users';
  private readonly rolesBase = '/admin/roles';

  constructor(private api: ApiService, private zone: NgZone) {}

  private toBool(v: any): boolean {
    return v === true || v === 1 || v === '1' || v === 'true';
  }

  private normalize(u: any): User {
    return {
      user_id: u.user_id ?? u.id,
      role_id: u.role_id ?? u.roleId,
      email: u.email,
      first_name: u.first_name ?? u.firstName,
      last_name: u.last_name ?? u.lastName,
      phone: u.phone ?? null,
      address: u.address ?? null,
      national_id: u.national_id ?? u.nationalId ?? null,
      two_factor_enabled: this.toBool(u.two_factor_enabled ?? u.twoFactorEnabled),
      active: this.toBool(u.active),
      created_at: u.created_at ?? u.createdAt,
      updated_at: u.updated_at ?? u.updatedAt,
    };
  }

  private wrapInZone<T>(obs: Observable<T>): Observable<T> {
    return new Observable<T>((sub) => {
      obs.subscribe({
        next: (v) => this.zone.run(() => sub.next(v)),
        error: (e) => this.zone.run(() => sub.error(e)),
        complete: () => sub.complete(),
      });
    });
  }

  list(): Observable<User[]> {
    return this.wrapInZone(
      this.api.get<UserListResponse>(this.base).pipe(
        map((res: any) => {
          const arr = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
          return (arr as any[]).map((x) => this.normalize(x));
        })
      )
    );
  }

  get(id: number): Observable<User> {
    return this.wrapInZone(
      this.api.get<any>(`${this.base}/${id}`).pipe(map((u) => this.normalize(u)))
    );
  }

  create(payload: CreateUserPayload): Observable<User> {
    return this.wrapInZone(
      this.api.post<any>(this.base, payload).pipe(map((u) => this.normalize(u)))
    );
  }

  update(payload: UpdateUserPayload): Observable<User> {
    if (!payload.user_id) throw new Error('user_id is required for update');
    return this.wrapInZone(
      this.api.put<any>(`${this.base}/${payload.user_id}`, payload).pipe(map((u) => this.normalize(u)))
    );
  }

  setStatus(id: number, active: boolean): Observable<void> {
    return this.wrapInZone(this.api.patch<void>(`${this.base}/${id}/status`, null, { active }));
  }

  remove(id: number): Observable<void> {
    return this.wrapInZone(this.api.delete<void>(`${this.base}/${id}`));
  }

  listRoles(): Observable<RoleRef[]> {
    return this.wrapInZone(
      this.api.get<any>(this.rolesBase).pipe(
        map((res: any) => {
          const raw: any[] = Array.isArray(res)
            ? res
            : (res?.content as any[]) || (res?.data as any[]) || [];
          return raw.map((r: any) => ({
            role_id: r.role_id ?? r.roleId ?? r.id,
            role_name: r.role_name ?? r.roleName ?? r.name,
          })) as RoleRef[];
        })
      )
    );
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, RoleRef } from './user.model';
// import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly USE_API = false;
  private readonly BASE_URL = '/api/users';
  private readonly ROLES_URL = '/api/roles';

  private roles: RoleRef[] = [
    { role_id: 1, role_name: 'Admin' },
    { role_id: 2, role_name: 'Coordinador' },
    { role_id: 3, role_name: 'Repartidor' },
    { role_id: 4, role_name: 'Operaciones' },
  ];

  private data: User[] = [
    { user_id: 1, role_id: 2, email: 'coord@sie.com', first_name: 'Ana', last_name: 'Gómez', phone: '2222-0001', address: 'Zona 10', national_id: '12345678', active: true, two_factor_enabled: true },
    { user_id: 2, role_id: 3, email: 'r1@sie.com',     first_name: 'Luis', last_name: 'Pérez', phone: '5555-1000', address: 'Mixco',  national_id: '87654321', active: true, two_factor_enabled: false },
    { user_id: 3, role_id: 3, email: 'r2@sie.com',     first_name: 'Marta', last_name: 'López', phone: '5555-2000', address: 'Villa Nueva', national_id: '55667788', active: true, two_factor_enabled: false },
  ];

  // constructor(private http: HttpClient) {}

  listRoles(): Observable<RoleRef[]> {
    if (this.USE_API) { /* return this.http.get<RoleRef[]>(this.ROLES_URL); */ }
    return of([...this.roles]).pipe(delay(100));
  }

  list(): Observable<User[]> {
    if (this.USE_API) { /* return this.http.get<User[]>(this.BASE_URL); */ }
    return of([...this.data]).pipe(delay(120));
  }

  get(id: number): Observable<User | undefined> {
    if (this.USE_API) { /* return this.http.get<User>(`${this.BASE_URL}/${id}`); */ }
    return of(this.data.find(x => x.user_id === id)).pipe(delay(100));
  }

  create(payload: User): Observable<User> {
    if (this.USE_API) { /* return this.http.post<User>(this.BASE_URL, payload); */ }
    const nextId = Math.max(0, ...this.data.map(x => x.user_id || 0)) + 1;
    const created: User = { ...payload, user_id: nextId };
    this.data = [...this.data, created];
    return of(created).pipe(delay(120));
  }

  update(payload: User): Observable<User> {
    if (this.USE_API) { /* return this.http.put<User>(`${this.BASE_URL}/${payload.user_id}`, payload); */ }
    this.data = this.data.map(x => (x.user_id === payload.user_id ? { ...x, ...payload } : x));
    return of(payload).pipe(delay(120));
  }

  remove(id: number): Observable<void> {
    if (this.USE_API) { /* return this.http.delete<void>(`${this.BASE_URL}/${id}`); */ }
    this.data = this.data.filter(x => x.user_id !== id);
    return of(void 0).pipe(delay(100));
  }
}

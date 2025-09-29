import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import { Branch } from './branch.model';

type BranchListResponse =
  | Branch[]
  | { data: any[]; total?: number; page?: number; pageSize?: number }
  | { content: any[]; totalElements?: number; totalPages?: number; number?: number; size?: number };

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly base = '/admin/branches';

  constructor(private api: ApiService) {}

  private toBool(v: any): boolean {
    return v === true || v === 1 || v === '1' || v === 'true';
  }

  private normalize(b: any): Branch {
    return {
      branch_id: b.branch_id,
      branch_code: b.branch_code,
      branch_name: b.branch_name,
      address: b.address,
      phone: b.phone ?? null,
      email: b.email ?? null,
      city: b.city ?? null,
      state: b.state ?? null,
      active: this.toBool(b.active),
      created_at: b.created_at,
      updated_at: b.updated_at,
    };
  }

  list(): Observable<Branch[]> {
    return this.api.get<BranchListResponse>(this.base).pipe(
      map((res: any) => {
        const arr = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
        return (arr as any[]).map(x => this.normalize(x));
      })
    );
  }

  get(id: number): Observable<Branch> {
    return this.api.get<any>(`${this.base}/${id}`).pipe(map(x => this.normalize(x)));
  }

  create(payload: Branch): Observable<Branch> {
    return this.api.post<any>(this.base, payload).pipe(map(x => this.normalize(x)));
  }

  update(payload: Branch): Observable<Branch> {
    if (!payload.branch_id) throw new Error('branch_id is required for update');
    return this.api.put<any>(`${this.base}/${payload.branch_id}`, payload).pipe(map(x => this.normalize(x)));
  }

  setStatus(id: number, active: boolean): Observable<void> {
    return this.api.patch<void>(`${this.base}/${id}/status`, null, { active });
  }

  remove(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}

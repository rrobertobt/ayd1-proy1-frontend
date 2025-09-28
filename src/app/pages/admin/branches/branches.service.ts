// src/app/pages/admin/branches/branches.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import { Branch } from './branch.model';

type BranchListResponse =
  | Branch[]
  | { data: Branch[]; total?: number; page?: number; pageSize?: number }
  | { content: Branch[]; totalElements?: number; totalPages?: number; number?: number; size?: number };

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly base = '/admin/branches';

  constructor(private api: ApiService) {}

  list(): Observable<Branch[]> {
    return this.api.get<BranchListResponse>(this.base).pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;         
        if (res?.data) return res.data as Branch[];  
        if (res?.content) return res.content as Branch[]; 
        return [];                                    
      })
    );
  }

  get(id: number): Observable<Branch> {
    return this.api.get<Branch>(`${this.base}/${id}`);
  }

  create(payload: Branch): Observable<Branch> {
    return this.api.post<Branch>(this.base, payload);
  }

  update(payload: Branch): Observable<Branch> {
    if (!payload.branch_id) throw new Error('branch_id is required for update');
    return this.api.put<Branch>(`${this.base}/${payload.branch_id}`, payload);
  }

  setStatus(id: number, active: boolean): Observable<void> {
    return this.api.patch<void>(`${this.base}/${id}/status`, null, { active });
  }

  remove(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}

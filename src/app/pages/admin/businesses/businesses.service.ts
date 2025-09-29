import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import { Business, LoyaltyLevelRef } from './business.model';

type BusinessListResponse =
  | Business[]
  | { data: Business[] }
  | { content: Business[] };

@Injectable({ providedIn: 'root' })
export class BusinessesService {
  private readonly base = '/admin/businesses';
  private readonly levelsBase = '/admin/loyalty-levels';

  constructor(private api: ApiService) {}

  list(): Observable<Business[]> {
    return this.api.get<BusinessListResponse>(this.base).pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;
        if (res?.data) return res.data as Business[];
        if (res?.content) return res.content as Business[];
        return [];
      })
    );
  }

  listLevels(): Observable<LoyaltyLevelRef[]> {
    return this.api.get<LoyaltyLevelRef[]>(this.levelsBase);
  }

  get(id: number): Observable<Business> {
    return this.api.get<Business>(`${this.base}/${id}`);
  }

  create(payload: Business): Observable<Business> {
    return this.api.post<Business>(this.base, payload);
  }

  update(payload: Business): Observable<Business> {
    if (!payload.business_id) throw new Error('business_id is required for update');
    return this.api.put<Business>(`${this.base}/${payload.business_id}`, payload);
  }

  setStatus(id: number, active: boolean): Observable<void> {
    return this.api.patch<void>(`${this.base}/${id}/status`, null, { active });
  }

  remove(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}

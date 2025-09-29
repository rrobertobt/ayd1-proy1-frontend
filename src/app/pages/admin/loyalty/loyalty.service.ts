import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoyaltyLevel } from './loyalty.model';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly base = '/admin/loyalty-levels';

  constructor(private api: ApiService) {}

  list(): Observable<LoyaltyLevel[]> {
    return this.api.get<LoyaltyLevel[]>(this.base);
  }

  get(id: number): Observable<LoyaltyLevel> {
    return this.api.get<LoyaltyLevel>(`${this.base}/${id}`);
  }

  update(payload: LoyaltyLevel): Observable<LoyaltyLevel> {
    if (!payload.level_id) throw new Error('level_id is required');
    return this.api.put<LoyaltyLevel>(`${this.base}/${payload.level_id}`, payload);
  }

  setStatus(id: number, active: boolean): Observable<void> {
    return this.api.patch<void>(`${this.base}/${id}/status`, null, { active });
  }
}

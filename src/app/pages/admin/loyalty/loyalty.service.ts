import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoyaltyLevel } from './loyalty.model';
// import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly USE_API = false;
  private readonly BASE_URL = '/api/loyalty-levels';

  private data: LoyaltyLevel[] = [
    { level_id: 1, level_name: 'Plata',    min_deliveries: 0,   max_deliveries: 99,  discount_percentage: 5,  free_cancellations: 0, penalty_percentage: 100, active: true },
    { level_id: 2, level_name: 'Oro',      min_deliveries: 100, max_deliveries: 299, discount_percentage: 8,  free_cancellations: 0, penalty_percentage: 50,  active: true },
    { level_id: 3, level_name: 'Diamante', min_deliveries: 300, max_deliveries: null,discount_percentage: 12, free_cancellations: 5, penalty_percentage: 0,   active: true },
  ];

  // constructor(private http: HttpClient) {}

  list(): Observable<LoyaltyLevel[]> {
    if (this.USE_API) {
      // return this.http.get<LoyaltyLevel[]>(this.BASE_URL);
    }
    return of([...this.data]).pipe(delay(120));
  }

  get(id: number): Observable<LoyaltyLevel | undefined> {
    if (this.USE_API) {
      // return this.http.get<LoyaltyLevel>(`${this.BASE_URL}/${id}`);
    }
    return of(this.data.find(x => x.level_id === id)).pipe(delay(100));
  }

  create(payload: LoyaltyLevel): Observable<LoyaltyLevel> {
    if (this.USE_API) {
      // return this.http.post<LoyaltyLevel>(this.BASE_URL, payload);
    }
    const nextId = Math.max(0, ...this.data.map(x => x.level_id || 0)) + 1;
    const created: LoyaltyLevel = { ...payload, level_id: nextId };
    this.data = [...this.data, created];
    return of(created).pipe(delay(120));
  }

  update(payload: LoyaltyLevel): Observable<LoyaltyLevel> {
    if (this.USE_API) {
      // return this.http.put<LoyaltyLevel>(`${this.BASE_URL}/${payload.level_id}`, payload);
    }
    this.data = this.data.map(x => (x.level_id === payload.level_id ? { ...x, ...payload } : x));
    return of(payload).pipe(delay(120));
  }

  remove(id: number): Observable<void> {
    if (this.USE_API) {
      // return this.http.delete<void>(`${this.BASE_URL}/${id}`);
    }
    this.data = this.data.filter(x => x.level_id !== id);
    return of(void 0).pipe(delay(100));
  }
}

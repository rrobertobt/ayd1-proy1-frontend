import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Business, LoyaltyLevelRef } from './business.model';
// import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BusinessesService {
  private readonly USE_API = false;
  private readonly BASE_URL = '/api/businesses';
  private readonly LEVELS_URL = '/api/loyalty-levels';

  // Mock niveles (Plata, Oro, Diamante) – reflejan loyalty_levels
  private levels: LoyaltyLevelRef[] = [
    { level_id: 1, level_name: 'Plata' },
    { level_id: 2, level_name: 'Oro' },
    { level_id: 3, level_name: 'Diamante' },
  ];

  // Mock comercios basados en tu esquema
  private data: Business[] = [
    {
      business_id: 1,
      user_id: 101,                
      current_level_id: 1,      
      tax_id: 'CF-1234567-0',
      business_name: 'Tienda El Centro',
      legal_name: 'El Centro S.A.',
      tax_address: '6a Avenida 10-55 Zona 1, Guatemala',
      business_phone: '2222-1000',
      business_email: 'contacto@elcentro.com',
      support_contact: 'María López',
      active: true,
      affiliation_date: '2024-03-01',
    },
    {
      business_id: 2,
      user_id: 102,
      current_level_id: 2,      
      tax_id: 'CF-7654321-9',
      business_name: 'Tecno Q',
      legal_name: 'Tecno Q, S.A.',
      tax_address: 'Boulevard Liberación 5-20 Zona 9, Guatemala',
      business_phone: '2333-2000',
      business_email: 'soporte@tecnoq.com',
      support_contact: 'Carlos Pérez',
      active: true,
      affiliation_date: '2024-04-15',
    },
  ];

  // constructor(private http: HttpClient) {}

  // ===== Niveles =====
  listLevels(): Observable<LoyaltyLevelRef[]> {
    if (this.USE_API) {
      // return this.http.get<LoyaltyLevelRef[]>(this.LEVELS_URL);
    }
    return of([...this.levels]).pipe(delay(100));
  }

  // ===== Comercios =====
  list(): Observable<Business[]> {
    if (this.USE_API) {
      // return this.http.get<Business[]>(this.BASE_URL);
    }
    return of([...this.data]).pipe(delay(120));
  }

  get(id: number): Observable<Business | undefined> {
    if (this.USE_API) {
      // return this.http.get<Business>(`${this.BASE_URL}/${id}`);
    }
    return of(this.data.find(b => b.business_id === id)).pipe(delay(100));
  }

  create(payload: Business): Observable<Business> {
    if (this.USE_API) {
      // return this.http.post<Business>(this.BASE_URL, payload);
    }
    const nextId = Math.max(0, ...this.data.map(x => x.business_id || 0)) + 1;
    const created: Business = { ...payload, business_id: nextId };
    this.data = [...this.data, created];
    return of(created).pipe(delay(120));
  }

  update(payload: Business): Observable<Business> {
    if (this.USE_API) {
      // return this.http.put<Business>(`${this.BASE_URL}/${payload.business_id}`, payload);
    }
    this.data = this.data.map(b => (b.business_id === payload.business_id ? { ...b, ...payload } : b));
    return of(payload).pipe(delay(120));
  }

  remove(id: number): Observable<void> {
    if (this.USE_API) {
      // return this.http.delete<void>(`${this.BASE_URL}/${id}`);
    }
    this.data = this.data.filter(b => b.business_id !== id);
    return of(void 0).pipe(delay(100));
  }
}

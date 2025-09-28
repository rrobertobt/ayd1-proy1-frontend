import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Contract, ContractTypeRef } from './contract.model';
// import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly USE_API = false;
  private readonly BASE_URL = '/api/contracts';
  private readonly TYPES_URL = '/api/contract-types';

  // Types seed (mirrors contract_types table)
  private types: ContractTypeRef[] = [
    { contract_type_id: 1, type_name: 'Tiempo completo' },
    { contract_type_id: 2, type_name: 'Medio tiempo' },
    { contract_type_id: 3, type_name: 'Por servicios' },
  ];

  // Contracts seed (mirrors contracts table)
  private data: Contract[] = [
    {
      contract_id: 1,
      user_id: 2,
      admin_id: 1,
      contract_type_id: 1,
      base_salary: 0,
      commission_percentage: 25,
      start_date: '2024-01-01',
      end_date: null,
      active: true,
      observations: 'Repartidor base',
    },
  ];

  // constructor(private http: HttpClient) {}

  // ---- Types ----
  listTypes(): Observable<ContractTypeRef[]> {
    if (this.USE_API) {
      // return this.http.get<ContractTypeRef[]>(this.TYPES_URL);
    }
    return of([...this.types]).pipe(delay(100));
  }

  // ---- Contracts (CRUD) ----
  list(): Observable<Contract[]> {
    if (this.USE_API) {
      // return this.http.get<Contract[]>(this.BASE_URL);
    }
    return of([...this.data]).pipe(delay(120));
  }

  get(id: number): Observable<Contract | undefined> {
    if (this.USE_API) {
      // return this.http.get<Contract>(`${this.BASE_URL}/${id}`);
    }
    return of(this.data.find(x => x.contract_id === id)).pipe(delay(100));
  }

  create(payload: Contract): Observable<Contract> {
    if (this.USE_API) {
      // return this.http.post<Contract>(this.BASE_URL, payload);
    }
    const nextId = Math.max(0, ...this.data.map(x => x.contract_id || 0)) + 1;
    const created: Contract = { ...payload, contract_id: nextId };
    this.data = [...this.data, created];
    return of(created).pipe(delay(120));
  }

  update(payload: Contract): Observable<Contract> {
    if (this.USE_API) {
      // return this.http.put<Contract>(`${this.BASE_URL}/${payload.contract_id}`, payload);
    }
    this.data = this.data.map(x => (x.contract_id === payload.contract_id ? { ...x, ...payload } : x));
    return of(payload).pipe(delay(120));
  }

  remove(id: number): Observable<void> {
    if (this.USE_API) {
      // return this.http.delete<void>(`${this.BASE_URL}/${id}`);
    }
    this.data = this.data.filter(x => x.contract_id !== id);
    return of(void 0).pipe(delay(100));
  }

  // ---- Extras for hiring flow ----

  listByUser(userId: number): Observable<Contract[]> {
    if (this.USE_API) {
      // return this.http.get<Contract[]>(`${this.BASE_URL}?user_id=${userId}`);
    }
    return of(this.data.filter(x => x.user_id === userId)).pipe(delay(80));
  }

  renew(base: Contract, start: string): Observable<Contract> {
    if (this.USE_API) {
      // return this.http.post<Contract>(`${this.BASE_URL}/renew`, { ...base, start });
    }
    const nextId = Math.max(0, ...this.data.map(x => x.contract_id || 0)) + 1;
    const copy: Contract = {
      ...base,
      contract_id: nextId,
      start_date: start,
      end_date: null,
      active: true,
    };
    this.data = [...this.data, copy];
    return of(copy).pipe(delay(100));
  }

  terminate(contractId: number, end: string): Observable<void> {
    if (this.USE_API) {
      // return this.http.post<void>(`${this.BASE_URL}/${contractId}/terminate`, { end });
    }
    this.data = this.data.map(c =>
      c.contract_id === contractId ? { ...c, end_date: end, active: false } : c
    );
    return of(void 0).pipe(delay(80));
  }
}

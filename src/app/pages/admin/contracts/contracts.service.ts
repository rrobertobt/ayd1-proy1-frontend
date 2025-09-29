import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import { Contract, ContractTypeRef } from './contract.model';

type ContractsListResponse = Contract[] | { content: any[] } | { data: any[] };
type ContractTypesResponse = ContractTypeRef[] | { content: any[] } | { data: any[] };

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly BASE = '/admin/contracts';
  private readonly TYPES = '/admin/contract-types';

  constructor(private api: ApiService, private zone: NgZone) {}

  private toBool(v: any): boolean {
    return v === true || v === 1 || v === '1' || v === 'true';
  }

  private normalize(c: any): Contract {
    return {
      contract_id: c.contract_id ?? c.contractId ?? c.id,
      user_id: c.user_id ?? c.userId,
      contract_type_id: c.contract_type_id ?? c.contractTypeId,
      base_salary: c.base_salary ?? c.baseSalary ?? null,
      commission_percentage: c.commission_percentage ?? c.commissionPercentage,
      start_date: c.start_date ?? c.startDate,
      end_date: c.end_date ?? c.endDate ?? null,
      observations: c.observations ?? c.notes ?? null,
      active: this.toBool(c.active),
      created_at: c.created_at ?? c.createdAt,
      updated_at: c.updated_at ?? c.updatedAt,
    };
  }

  private normalizeType(x: any): ContractTypeRef {
    return {
      contract_type_id: x.contract_type_id ?? x.contractTypeId ?? x.id,
      type_name: x.type_name ?? x.typeName ?? x.name,
    };
  }

  private inZone<T>(obs: Observable<T>): Observable<T> {
    return new Observable<T>((sub) => {
      obs.subscribe({
        next: (v) => this.zone.run(() => sub.next(v)),
        error: (e) => this.zone.run(() => sub.error(e)),
        complete: () => sub.complete(),
      });
    });
  }

  list(): Observable<Contract[]> {
    return this.inZone(
      this.api.get<ContractsListResponse>(this.BASE).pipe(
        map((res: any) => {
          const arr: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
          return arr.map((x) => this.normalize(x));
        })
      )
    );
  }

  listByUser(userId: number): Observable<Contract[]> {
    return this.list().pipe(map(rows => rows.filter(c => c.user_id === userId)));
  }

  get(id: number): Observable<Contract> {
    return this.inZone(this.api.get<any>(`${this.BASE}/${id}`).pipe(map(x => this.normalize(x))));
  }

  create(payload: Contract): Observable<Contract> {
    return this.inZone(this.api.post<any>(this.BASE, payload).pipe(map(x => this.normalize(x))));
  }

  update(payload: Contract): Observable<Contract> {
    if (!payload.contract_id) throw new Error('contract_id is required');
    return this.inZone(
      this.api.put<any>(`${this.BASE}/${payload.contract_id}`, payload).pipe(map(x => this.normalize(x)))
    );
  }

  setStatus(id: number, active: boolean): Observable<void> {
    return this.inZone(this.api.patch<void>(`${this.BASE}/${id}/status`, null, { active }));
  }

  terminate(id: number, endDate: string): Observable<void> {
    return this.inZone(this.api.patch<void>(`${this.BASE}/${id}/terminate`, { end_date: endDate }));
  }

  remove(id: number): Observable<void> {
    return this.inZone(this.api.delete<void>(`${this.BASE}/${id}`));
  }

  listTypes(): Observable<ContractTypeRef[]> {
    return this.inZone(
      this.api.get<ContractTypesResponse>(this.Otypes).pipe(
        map((res: any) => {
          const arr: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
          return arr.map((x) => this.normalizeType(x));
        })
      )
    );
  }

  private get Otypes() { return this.TYPES; }

  getType(id: number): Observable<ContractTypeRef> {
    return this.inZone(this.api.get<any>(`${this.TYPES}/${id}`).pipe(map(x => this.normalizeType(x))));
  }
}

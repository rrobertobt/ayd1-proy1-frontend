import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import { Business, LoyaltyLevelRef } from './business.model';

type BusinessListResponse =
  | Business[]
  | { data: Business[]; total?: number }
  | { content: Business[]; totalElements?: number };

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

  get(id: number): Observable<Business> {
    return this.api.get<Business>(`${this.base}/${id}`);
  }

  listLevels(): Observable<LoyaltyLevelRef[]> {
    return this.api.get<LoyaltyLevelRef[]>(this.levelsBase);
  }

  // POST /admin/businesses expects owner + commerce + initial_level_id
  create(form: Business): Observable<Business> {
    const body: any = {
      email: form.email ?? '',
      first_name: form.first_name ?? '',
      last_name: form.last_name ?? '',
      phone: form.phone ?? '',
      address: form.address ?? '',
      national_id: form.national_id ?? '',
      tax_id: form.tax_id,
      business_name: form.business_name,
      legal_name: form.legal_name,
      tax_address: form.tax_address,
      business_phone: form.business_phone ?? '',
      business_email: form.business_email ?? '',
      support_contact: form.support_contact ?? '',
      affiliation_date: form.affiliation_date ?? '',
      initial_level_id: form.initial_level_id ?? null,
    };
    return this.api.post<Business>(this.base, body);
  }

  // PUT /admin/businesses/{businessId} accepts only commerce fields
  update(form: Business): Observable<Business> {
    if (!form.business_id) throw new Error('business_id is required for update');
    const body: any = {
      business_name: form.business_name,
      legal_name: form.legal_name,
      tax_address: form.tax_address,
      business_phone: form.business_phone ?? '',
      business_email: form.business_email ?? '',
      support_contact: form.support_contact ?? '',
    };
    return this.api.put<Business>(`${this.base}/${form.business_id}`, body);
  }

  setStatus(id: number, active: boolean): Observable<void> {
    return this.api.patch<void>(`${this.base}/${id}/status`, null, { active });
  }

  remove(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}

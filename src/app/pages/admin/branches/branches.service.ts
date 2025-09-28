import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Branch } from './branch.model';
// import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly USE_API = false;
  private readonly BASE_URL = '/api/branches';

  // FAKE DATA TEMPORAL
  private data: Branch[] = [
    { branch_id: 1, branch_code: 'SUC001', branch_name: 'Sucursal Central',
      address: 'Avenida Reforma 15-45 Zona 10', phone: '23660000', email: 'central@sie.com.gt',
      city: 'Guatemala', state: 'Guatemala', active: true },
    { branch_id: 2, branch_code: 'SUC002', branch_name: 'Sucursal Zona 4',
      address: 'Septima Avenida 5-20 Zona 4', phone: '23661111', email: 'zona4@sie.com.gt',
      city: 'Guatemala', state: 'Guatemala', active: true },
    { branch_id: 3, branch_code: 'SUC003', branch_name: 'Sucursal Mixco',
      address: 'Boulevard San Cristobal 10-50', phone: '24850000', email: 'mixco@sie.com.gt',
      city: 'Mixco', state: 'Guatemala', active: true },
    { branch_id: 4, branch_code: 'SUC004', branch_name: 'Sucursal Villa Nueva',
      address: 'Calzada Aguilar Batres Km 15', phone: '66300000', email: 'villanueva@sie.com.gt',
      city: 'Villa Nueva', state: 'Guatemala', active: true },
    { branch_id: 5, branch_code: 'SUC005', branch_name: 'Sucursal Carretera Salvador',
      address: 'Km 9 Carretera al Salvador', phone: '66310000', email: 'salvador@sie.com.gt',
      city: 'Sta. Catarina Pinula', state: 'Guatemala', active: true },
  ];

  // constructor(private http: HttpClient) {}

  list(): Observable<Branch[]> {
    if (this.USE_API) {
      // return this.http.get<Branch[]>(this.BASE_URL);
    }
    return of([...this.data]).pipe(delay(120));
  }

  get(id: number): Observable<Branch | undefined> {
    if (this.USE_API) {
      // return this.http.get<Branch>(`${this.BASE_URL}/${id}`);
    }
    return of(this.data.find(b => b.branch_id === id)).pipe(delay(100));
  }

  create(payload: Branch): Observable<Branch> {
    if (this.USE_API) {
      // return this.http.post<Branch>(this.BASE_URL, payload);
    }
    const nextId = Math.max(0, ...this.data.map(x => x.branch_id || 0)) + 1;
    const created: Branch = { ...payload, branch_id: nextId };
    this.data = [...this.data, created];
    return of(created).pipe(delay(120));
  }

  update(payload: Branch): Observable<Branch> {
    if (this.USE_API) {
      // return this.http.put<Branch>(`${this.BASE_URL}/${payload.branch_id}`, payload);
    }
    this.data = this.data.map(b => (b.branch_id === payload.branch_id ? { ...b, ...payload } : b));
    return of(payload).pipe(delay(120));
  }

  remove(id: number): Observable<void> {
    if (this.USE_API) {
      // return this.http.delete<void>(`${this.BASE_URL}/${id}`);
    }
    this.data = this.data.filter(b => b.branch_id !== id);
    return of(void 0).pipe(delay(100));
  }
}

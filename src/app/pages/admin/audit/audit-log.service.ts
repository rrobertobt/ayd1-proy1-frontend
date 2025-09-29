import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import { AuditLogEntry, AuditQuery } from './audit-log.types';

type RawList =
  | AuditLogEntry[]
  | { content: any[] }
  | { data: any[] };

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly base = '/admin/audit-log';
  constructor(private api: ApiService, private zone: NgZone) {}

  private normalize(x: any): AuditLogEntry {
    return {
      log_id: x.log_id ?? x.id,
      user_id: x.user_id ?? null,
      table_name: x.table_name ?? x.tableName,
      operation_type_id: x.operation_type_id ?? x.operationTypeId,
      record_id: x.record_id ?? null,
      old_data: x.old_data ?? null,
      new_data: x.new_data ?? null,
      ip_address: x.ip_address ?? null,
      user_agent: x.user_agent ?? null,
      created_at: x.created_at ?? x.createdAt,
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

  list(q: AuditQuery): Observable<AuditLogEntry[]> {
    const params: any = {};
    if (q.tableName && String(q.tableName).trim()) params.tableName = String(q.tableName).trim();
    if (q.userId != null && !Number.isNaN(q.userId)) params.userId = q.userId;
    if (q.startDate) params.startDate = q.startDate;
    if (q.endDate) params.endDate = q.endDate;

    return this.inZone(
      this.api.get<RawList>(this.base, params).pipe(
        map((res: any) => {
          const arr: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
          return arr.map((r) => this.normalize(r));
        })
      )
    );
  }
}

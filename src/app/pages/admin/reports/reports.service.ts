import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export type ReportKey =
  | 'discounts'
  | 'deliveries'
  | 'commissions'
  | 'cancellations'
  | 'business-ranking';

export interface ReportQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private baseByKey: Record<ReportKey, string> = {
    discounts: '/reports/discounts',
    deliveries: '/reports/deliveries',
    commissions: '/reports/commissions',
    cancellations: '/reports/cancellations',
    'business-ranking': '/reports/business-ranking',
  };

  constructor(private api: ApiService, private http: HttpClient) {}

  list(report: ReportKey, q: ReportQuery): Observable<any[]> {
    const url = this.baseByKey[report];
    return this.api.get<any>(url, q as any).pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;
        const arr = res?.content ?? res?.data ?? res;
        return Array.isArray(arr) ? arr : (arr ? [arr] : []);
      })
    );
  }

  export(report: ReportKey, fmt: 'pdf' | 'image' | 'excel', q: ReportQuery): void {
    const url = `${this.baseByKey[report]}/export/${fmt}`;

    let params = new HttpParams()
      .set('startDate', q.startDate)
      .set('endDate', q.endDate);

    this.http
      .get(url, { params, observe: 'response', responseType: 'blob' })
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          const blob = res.body ?? new Blob();
          const mime =
            fmt === 'pdf'
              ? 'application/pdf'
              : fmt === 'excel'
              ? 
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'image/png';
          const typedBlob = new Blob([blob], { type: mime });

          const cd = res.headers.get('content-disposition') || '';
          const fromHeader =
            /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1] ||
            /filename="?([^"]+)"?/i.exec(cd)?.[1];
          const ext = fmt === 'pdf' ? 'pdf' : fmt === 'excel' ? 'xlsx' : 'png';
          const def = `${report}-${q.startDate}_to_${q.endDate}.${ext}`;
          const filename = decodeURIComponent((fromHeader || def).replace(/["']/g, ''));

          const link = document.createElement('a');
          const urlObj = URL.createObjectURL(typedBlob);
          link.href = urlObj;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(urlObj);
        },
        error: (err) => {
          console.error('Export failed', err);
        },
      });
  }
}

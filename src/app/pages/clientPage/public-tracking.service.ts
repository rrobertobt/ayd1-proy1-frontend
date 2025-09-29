import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../core/http/api.service';

export interface TrackingStep {
  status: string;
  timestamp?: string;
  location?: string | null;
  notes?: string | null;
}

export interface TrackingInfo {
  guide_number: string;
  status: string;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  delivered_at?: string | null;
  steps?: TrackingStep[];
  [k: string]: any;
}

export interface RejectPayload {
  guide_number: string;
  user_email: string;
  rejection_reason: string;
  requires_return: boolean;
}

@Injectable({ providedIn: 'root' })
export class PublicTrackingService {
  // NO /api/v1 aquí. ApiService ya antepone environment.apiBaseUrl
  private readonly base = '/tracking/public';

  constructor(private api: ApiService) {}

  /** GET /tracking/public/search?guideNumber=... */
  search(guideNumber: string): Observable<TrackingInfo> {
    const params = new HttpParams().set('guideNumber', guideNumber.trim());
    return this.api
      .get<any>(`${this.base}/search`, { params })
      .pipe(map((x) => this.normalize(x)));
  }

  /** GET /tracking/public/{guideNumber} */
  getOne(guideNumber: string): Observable<TrackingInfo> {
    const gn = encodeURIComponent(guideNumber.trim());
    return this.api
      .get<any>(`${this.base}/${gn}`)
      .pipe(map((x) => this.normalize(x)));
  }

  /** POST /tracking/public/reject */
  reject(payload: RejectPayload): Observable<void> {
    const body: RejectPayload = {
      guide_number: payload.guide_number,
      user_email: payload.user_email,
      rejection_reason: payload.rejection_reason,
      requires_return: !!payload.requires_return,
    };
    return this.api.post<void>(`${this.base}/reject`, body);
  }

  private normalize(x: any): TrackingInfo {
    if (!x) return { guide_number: '', status: 'UNKNOWN' };
    return {
      guide_number: x.guide_number ?? x.guideNumber ?? '',
      status: x.status ?? 'UNKNOWN',
      receiver_name: x.receiver_name ?? x.receiverName ?? null,
      receiver_phone: x.receiver_phone ?? x.receiverPhone ?? null,
      delivered_at: x.delivered_at ?? x.deliveredAt ?? null,
      steps: (x.steps ?? x.history ?? []).map((s: any) => ({
        status: s.status,
        timestamp: s.timestamp ?? s.date ?? null,
        location: s.location ?? null,
        notes: s.notes ?? null,
      })),
      ...x,
    };
  }
}

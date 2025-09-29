import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../core/http/api.service';

export interface TrackingInfo {
  guide_number: string;
  current_status: string;
  recipient_name: string | null;
  recipient_address: string | null;
  recipient_city: string | null;
  recipient_state: string | null;
  base_price: number | null;
  created_at: string | null;
  assignment_date: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  observations: string | null;
  can_reject: boolean;
  business_name: string | null;
  courier_name: string | null;
  courier_phone: string | null;
  status_history: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  status_name: string;
  changed_at: string | null;
  changed_by: string | null;
  observations: string | null;
}

export interface RejectPayload {
  guide_number: string;
  user_email: string;
  rejection_reason: string;
  requires_return: boolean;
}

@Injectable({ providedIn: 'root' })
export class PublicTrackingService {
  private readonly base = '/tracking/public';

  constructor(private api: ApiService) {}

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
    if (!x) {
      return {
        guide_number: '',
        current_status: 'DESCONOCIDO',
        recipient_name: null,
        recipient_address: null,
        recipient_city: null,
        recipient_state: null,
        base_price: null,
        created_at: null,
        assignment_date: null,
        pickup_date: null,
        delivery_date: null,
        observations: null,
        can_reject: false,
        business_name: null,
        courier_name: null,
        courier_phone: null,
        status_history: [],
      };
    }
    const history = Array.isArray(x.status_history) ? x.status_history : [];
    const rawPrice = x.base_price ?? x.basePrice;
    const numericPrice = Number(rawPrice);
    const basePrice =
      rawPrice === undefined || rawPrice === null || Number.isNaN(numericPrice)
        ? null
        : numericPrice;
    return {
      guide_number: x.guide_number ?? x.guideNumber ?? '',
      current_status: x.current_status ?? x.status ?? 'DESCONOCIDO',
      recipient_name: x.recipient_name ?? null,
      recipient_address: x.recipient_address ?? null,
      recipient_city: x.recipient_city ?? null,
      recipient_state: x.recipient_state ?? null,
      base_price: basePrice,
      created_at: x.created_at ?? null,
      assignment_date: x.assignment_date ?? null,
      pickup_date: x.pickup_date ?? null,
      delivery_date: x.delivery_date ?? null,
      observations: x.observations ?? null,
      can_reject: Boolean(x.can_reject),
      business_name: x.business_name ?? null,
      courier_name: x.courier_name ?? null,
      courier_phone: x.courier_phone ?? null,
      status_history: history.map((s: any) => ({
        status_name: s?.status_name ?? s?.status ?? '—',
        changed_at: s?.changed_at ?? s?.timestamp ?? null,
        changed_by: s?.changed_by ?? null,
        observations: s?.observations ?? null,
      })),
    };
  }
}

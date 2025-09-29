import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface DashboardPendingDelivery {
  guide_id: number;
  guide_number: string;
  business_name: string;
  recipient_name: string;
  current_state: string;
  created_at: string;
  assigned_courier: string;
  priority: string;
}

export interface DashboardIncident {
  incident_id: number;
  guide_number: string;
  incident_type: string;
  reported_by: string;
  created_at: string;
  resolved: boolean;
}

export interface DashboardCourierWorkload {
  courier_id: number;
  courier_name: string;
  assigned_count: number;
  completed_count: number;
  pending_count: number;
  incidents_count: number;
  has_active_contract: boolean;
  completion_rate: number;
}

export interface DashboardResponse {
  dashboard_date: string;
  last_updated: string;
  total_created: number;
  total_assigned: number;
  total_picked_up: number;
  total_in_route: number;
  total_completed: number;
  total_cancelled: number;
  total_rejected: number;
  total_incidents: number;
  pending_assignments: number;
  active_couriers: number;
  couriers_with_contracts: number;
  unresolved_incidents: number;
  completion_percentage: number;
  efficiency_metric: number;
  recent_pending_deliveries: DashboardPendingDelivery[];
  recent_incidents: DashboardIncident[];
  courier_workload: DashboardCourierWorkload[];
}

export interface DashboardStatsResponse {
  pending_deliveries: number;
  unresolved_incidents: number;
  coordinator_id: number;
  total_couriers: number;
  active_couriers: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getDashboardData(): Observable<DashboardResponse> {
    return this.api.get<DashboardResponse>('/coordinator/dashboard');
  }

  getDashboardStats(): Observable<DashboardStatsResponse> {
    return this.api.get<DashboardStatsResponse>('/coordinator/dashboard/stats');
  }
}

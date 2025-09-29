import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import {
  DashboardResponse,
  DashboardService,
  DashboardStatsResponse,
} from './dahsboard.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, CardModule, SkeletonModule, ButtonModule, TagModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly stats = signal<DashboardResponse | null>(null);
  protected readonly overviewStats = signal<DashboardStatsResponse | null>(null);
  protected readonly overviewMetrics = computed(() => {
    const overview = this.overviewStats();
    if (!overview) return [];
    return [
      {
        label: 'Entregas pendientes',
        value: overview.pending_deliveries,
        helper: 'Guías sin asignar o pendientes de gestión',
      },
      {
        label: 'Incidentes abiertos',
        value: overview.unresolved_incidents,
        helper: 'Requieren seguimiento del coordinador',
      },
      {
        label: 'Couriers totales',
        value: overview.total_couriers,
        helper: `Coordinador #${overview.coordinator_id}`,
      },
      {
        label: 'Couriers activos',
        value: overview.active_couriers,
        helper: 'Actualmente conectados o en servicio',
      },
    ];
  });

  protected readonly summaryCards = computed(() => {
    const data = this.stats();
    if (!data) return [];
    return [
      { label: 'Guías creadas', value: data.total_created },
      { label: 'Asignadas', value: data.total_assigned },
      { label: 'En ruta', value: data.total_in_route },
      { label: 'Completadas', value: data.total_completed },
      { label: 'Canceladas', value: data.total_cancelled },
      { label: 'Rechazadas', value: data.total_rejected },
    ];
  });

  protected readonly performanceCards = computed(() => {
    const data = this.stats();
    if (!data) return [];
    return [
      {
        label: 'Índice de finalización',
        value: `${data.completion_percentage}%`,
        helper: 'Porcentaje de guías entregadas exitosamente',
      },
      {
        label: 'Métrica de eficiencia',
        value: `${data.efficiency_metric.toFixed(1)}%`,
        helper: 'Eficiencia ponderada de operaciones recientes',
      },
      {
        label: 'Repartidores activos',
        value: data.active_couriers,
        helper: `${data.couriers_with_contracts} con contrato vigente`,
      },
      {
        label: 'Incidentes abiertos',
        value: data.unresolved_incidents,
        helper: `${data.total_incidents} incidentes en total`,
      },
      {
        label: 'Pendientes de asignar',
        value: data.pending_assignments,
        helper: 'Guías esperando asignación de courier',
      },
    ];
  });

  protected readonly recentPendingDeliveries = computed(() => {
    const data = this.stats();
    return data?.recent_pending_deliveries ?? [];
  });

  protected readonly recentIncidents = computed(() => {
    const data = this.stats();
    return data?.recent_incidents ?? [];
  });

  protected readonly courierWorkload = computed(() => {
    const data = this.stats();
    return data?.courier_workload ?? [];
  });

  ngOnInit(): void {
    this.loadDashboard();
    this.loadOverviewStats();
  }

  protected refresh(): void {
    this.loadDashboard(true);
    this.loadOverviewStats(true);
  }

  private loadDashboard(force = false): void {
    if (this.loading()) return;
    this.loading.set(true);
    if (force) {
      this.errorMessage.set('');
    }

    this.dashboardService
      .getDashboardData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
          this.errorMessage.set('');
        },
        error: (error) => {
          console.error('Failed to load dashboard data', error);
          this.messageError(error ?? new Error('No se pudo cargar el resumen.'));
          this.loading.set(false);
        },
      });
  }

  private loadOverviewStats(force = false): void {
    if (force) {
      this.errorMessage.set('');
    }

    this.dashboardService
      .getDashboardStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.overviewStats.set(data);
        },
        error: (error) => {
          console.error('Failed to load dashboard stats', error);
          this.messageError(error);
        },
      });
  }

  private messageError(error: any): void {
    const message = error?.message ?? 'Hubo un problema cargando la información.';
    this.errorMessage.set(message);
  }
}

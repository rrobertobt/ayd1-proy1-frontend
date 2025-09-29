import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCheck, tablerClockExclamation, tablerExclamationCircle } from '@ng-icons/tabler-icons';
import { ApiService } from '../../../core/http/api.service';

type IncidentFilter = 'all' | 'open' | 'resolved';

interface IncidentItem {
  incident_id: number;
  guide_id: number;
  guide_number: string;
  incident_type_id: number;
  incident_type_name: string;
  requires_return: boolean;
  reported_by_user_id: number;
  reported_by_name: string;
  reported_by_role: string;
  description: string;
  resolution: string | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by_user_id: number | null;
  resolved_by_name: string | null;
  business_name: string;
  recipient_name: string;
  recipient_address: string;
  current_state: string;
  created_at: string;
  updated_at: string;
}

interface IncidentResponse {
  content: IncidentItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  last: boolean;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
}

@Component({
  selector: 'app-incidents-page',
  imports: [CommonModule, NgIcon, RouterLink],
  templateUrl: './incidents-page.html',
  viewProviders: [
    provideIcons({
      tablerExclamationCircle,
      tablerClockExclamation,
      tablerCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tabOptions: {
    key: IncidentFilter;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      key: 'all',
      label: 'Todos',
      description: 'Todos los incidentes reportados.',
      icon: 'tablerExclamationCircle',
    },
    {
      key: 'open',
      label: 'Abiertos',
      description: 'Incidentes sin resolver que requieren acción.',
      icon: 'tablerClockExclamation',
    },
    {
      key: 'resolved',
      label: 'Resueltos',
      description: 'Incidentes atendidos y cerrados.',
      icon: 'tablerCheck',
    },
  ];

  protected readonly currentTab = signal<IncidentFilter>('all');
  protected readonly incidents = signal<IncidentItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly totalElements = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly isFirstPage = signal(true);
  protected readonly isLastPage = signal(true);
  protected readonly numberOfElements = signal(0);
  protected readonly pageSizeOptions = [10, 20, 50];

  protected readonly pageRangeLabel = computed(() => {
    const total = this.totalElements();
    if (total === 0) return '0 de 0';

    const current = this.pageIndex();
    const size = this.pageSize();
    const count = this.numberOfElements();
    const start = current * size + 1;

    if (count <= 0) {
      const safe = Math.min(start, total);
      return `${safe} de ${total}`;
    }

    const end = Math.min(start + count - 1, total);
    return `${start} - ${end} de ${total}`;
  });

  private readonly baseEndpoint = '/coordinator/incidents';
  private readonly resolvedFilterByTab: Record<IncidentFilter, boolean | null> = {
    all: null,
    open: false,
    resolved: true,
  };

  ngOnInit(): void {
    this.loadIncidents('all', 0, this.pageSize());
  }

  protected selectTab(tab: IncidentFilter): void {
    if (this.currentTab() === tab) return;
    this.currentTab.set(tab);
    this.pageIndex.set(0);
    this.incidents.set([]);
    this.loadIncidents(tab, 0, this.pageSize());
  }

  protected refreshCurrent(): void {
    this.loadIncidents(this.currentTab(), this.pageIndex(), this.pageSize());
  }

  protected goToPreviousPage(): void {
    if (this.isFirstPage() || this.loading()) return;
    const target = Math.max(this.pageIndex() - 1, 0);
    this.pageIndex.set(target);
    this.loadIncidents(this.currentTab(), target, this.pageSize());
  }

  protected goToNextPage(): void {
    if (this.isLastPage() || this.loading()) return;
    const target = Math.min(this.pageIndex() + 1, this.totalPages() - 1);
    this.pageIndex.set(target);
    this.loadIncidents(this.currentTab(), target, this.pageSize());
  }

  protected onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    if (!size || size === this.pageSize()) return;
    this.pageSize.set(size);
    this.pageIndex.set(0);
    this.loadIncidents(this.currentTab(), 0, size);
  }

  private loadIncidents(tab: IncidentFilter, page = 0, size = 20): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const resolved = this.resolvedFilterByTab[tab];
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (resolved !== null) {
      params.set('resolved', String(resolved));
    }

    this.api
      .get<IncidentResponse>(`${this.baseEndpoint}?${params.toString()}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const incidents = response?.content ?? [];
          this.incidents.set(incidents);
          this.totalElements.set(response?.totalElements ?? incidents.length);
          this.pageIndex.set(response?.number ?? page);
          this.pageSize.set(response?.size ?? size);
          this.totalPages.set(Math.max(response?.totalPages ?? 1, 1));
          this.numberOfElements.set(response?.numberOfElements ?? incidents.length);
          this.isFirstPage.set(response?.first ?? page === 0);
          this.isLastPage.set(response?.last ?? true);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          const message = error?.message ?? 'No se pudieron cargar los incidentes.';
          this.errorMessage.set(message);
          this.incidents.set([]);
          this.totalElements.set(0);
          this.totalPages.set(1);
          this.numberOfElements.set(0);
          this.isFirstPage.set(true);
          this.isLastPage.set(true);
        },
      });
  }
}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerClock,
  tablerHistory,
  tablerList
} from '@ng-icons/tabler-icons';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../../../core/http/api.service';

type DeliveryTab = 'all' | 'pending' | 'history';

interface DeliveryGuide {
  guide_id: number;
  guide_number: string;
  courier_id: number;
  courier_name: string;
  coordinator_id: number;
  coordinator_name: string;
  assignment_criteria: string | null;
  base_price: number;
  courier_commission: number;
  assigned_at: string | null;
  assignment_accepted: boolean;
  assignment_accepted_at: string | null;
  business_name: string;
  recipient_name: string;
  recipient_address: string;
  current_state: string;
  observations: string | null;
}

interface DeliveryResponse {
  content: DeliveryGuide[];
  [key: string]: unknown;
}

@Component({
  selector: 'app-deliveries-page',
  imports: [CommonModule, ButtonModule, NgIcon, RouterLink],
  templateUrl: './deliveries-page.html',
  viewProviders: [provideIcons({ tablerList, tablerClock, tablerHistory })],
  styleUrl: './deliveries-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveriesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tabOptions: {
    key: DeliveryTab;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      key: 'all',
      label: 'Todas',
      description: 'Todas las guías activas y en curso.',
      icon: 'tablerList',
    },
    {
      key: 'pending',
      label: 'Pendientes',
      description: 'Guías por asignar o en revisión.',
      icon: 'tablerClock',
    },
    {
      key: 'history',
      label: 'Historial',
      description: 'Guías finalizadas o archivadas.',
      icon: 'tablerHistory',
    },
  ];

  protected readonly currentTab = signal<DeliveryTab>('all');
  protected readonly deliveries = signal<DeliveryGuide[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  private readonly endpointByTab: Record<DeliveryTab, string> = {
    all: '/coordinator/deliveries/all',
    pending: '/coordinator/deliveries/pending',
    history: '/coordinator/deliveries/history',
  };

  private readonly deliveriesCache = new Map<DeliveryTab, DeliveryGuide[]>();

  ngOnInit(): void {
    this.loadDeliveries('all');
  }

  protected selectTab(tab: DeliveryTab): void {
    if (this.currentTab() === tab) {
      return;
    }
    this.currentTab.set(tab);
    this.deliveries.set([]);
    this.loadDeliveries(tab);
  }

  protected refreshCurrent(): void {
    const tab = this.currentTab();
    this.loadDeliveries(tab);
  }

  private loadDeliveries(tab: DeliveryTab): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const endpoint = this.endpointByTab[tab];
    this.api
      .get<DeliveryResponse>(endpoint)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const guides = response?.content ?? [];
          this.deliveriesCache.set(tab, guides);
          this.deliveries.set(guides);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          const message = error?.message ?? 'No se pudieron cargar las entregas.';
          this.errorMessage.set(message);
          this.deliveries.set([]);
        },
      });
  }
}

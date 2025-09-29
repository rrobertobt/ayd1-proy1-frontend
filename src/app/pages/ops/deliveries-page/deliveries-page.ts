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
import { tablerClock, tablerHistory, tablerList } from '@ng-icons/tabler-icons';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

interface CancellationType {
  cancellation_type_id: number;
  cancellation_type_name: string;
  apply_penalty_default?: boolean;
}

@Component({
  selector: 'app-deliveries-page',
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    AutoCompleteModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ToastModule,
    SelectModule,
    NgIcon,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './deliveries-page.html',
  viewProviders: [provideIcons({ tablerList, tablerClock, tablerHistory })],
  styleUrl: './deliveries-page.css',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveriesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

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
  protected readonly totalElements = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly isFirstPage = signal(true);
  protected readonly isLastPage = signal(true);
  protected readonly numberOfElements = signal(0);
  protected readonly pageSizeOptions = [10, 20, 50];
  protected readonly cancellationDialogVisible = signal(false);
  protected readonly submittingCancellation = signal(false);
  protected readonly cancellationTypes = signal<CancellationType[]>([]);
  protected readonly cancellationError = signal('');
  protected readonly cancellationGuide = signal<DeliveryGuide | null>(null);
  protected readonly cancellationForm = this.fb.nonNullable.group({
    guide_id: [null as number | null, Validators.required],
    cancellation_type_id: [null as number | null, Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]],
    apply_penalty: [false],
    notify_courier: [true],
    notify_customer: [true],
    notify_business: [true],
    notes: [''],
  });

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

  private readonly endpointByTab: Record<DeliveryTab, string> = {
    all: '/coordinator/deliveries/all',
    pending: '/coordinator/deliveries/pending',
    history: '/coordinator/deliveries/history',
  };

  ngOnInit(): void {
    this.loadDeliveries('all', 0, this.pageSize());
    this.loadCancellationTypes();

    this.cancellationForm.controls.cancellation_type_id.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((typeId) => {
        if (typeId == null) return;
        const current = this.cancellationTypes().find(
          (type) => type.cancellation_type_id === typeId
        );
        if (current) {
          this.cancellationForm.controls.apply_penalty.setValue(
            current.apply_penalty_default ?? false,
            { emitEvent: false }
          );
        }
      });
  }

  protected selectTab(tab: DeliveryTab): void {
    if (this.currentTab() === tab) return;
    this.currentTab.set(tab);
    this.pageIndex.set(0);
    this.deliveries.set([]);
    this.loadDeliveries(tab, 0, this.pageSize());
  }

  protected refreshCurrent(): void {
    this.loadDeliveries(this.currentTab(), this.pageIndex(), this.pageSize());
  }

  protected goToPreviousPage(): void {
    if (this.isFirstPage() || this.loading()) return;
    const target = Math.max(this.pageIndex() - 1, 0);
    this.pageIndex.set(target);
    this.loadDeliveries(this.currentTab(), target, this.pageSize());
  }

  protected goToNextPage(): void {
    if (this.isLastPage() || this.loading()) return;
    const target = Math.min(this.pageIndex() + 1, this.totalPages() - 1);
    this.pageIndex.set(target);
    this.loadDeliveries(this.currentTab(), target, this.pageSize());
  }

  protected onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    if (!size || size === this.pageSize()) return;
    this.pageSize.set(size);
    this.pageIndex.set(0);
    this.loadDeliveries(this.currentTab(), 0, size);
  }

  private loadDeliveries(tab: DeliveryTab, page = 0, size = 20): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const endpoint = this.endpointByTab[tab];
    this.api
      .get<DeliveryResponse>(`${endpoint}?page=${page}&size=${size}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const guides = response?.content ?? [];
          this.deliveries.set(guides);
          this.totalElements.set(response?.totalElements ?? guides.length);
          this.pageIndex.set(response?.number ?? page);
          this.pageSize.set(response?.size ?? size);
          this.totalPages.set(Math.max(response?.totalPages ?? 1, 1));
          this.numberOfElements.set(response?.numberOfElements ?? guides.length);
          this.isFirstPage.set(response?.first ?? page === 0);
          this.isLastPage.set(response?.last ?? true);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          const message = error?.message ?? 'No se pudieron cargar las entregas.';
          this.errorMessage.set(message);
          this.deliveries.set([]);
          this.totalElements.set(0);
          this.totalPages.set(1);
          this.numberOfElements.set(0);
          this.isFirstPage.set(true);
          this.isLastPage.set(true);
        },
      });
  }

  protected openCancellationDialog(delivery: DeliveryGuide): void {
    this.cancellationGuide.set(delivery);
    this.cancellationError.set('');
    this.cancellationForm.reset({
      guide_id: delivery.guide_id,
      cancellation_type_id: null,
      reason: '',
      apply_penalty: false,
      notify_courier: true,
      notify_customer: true,
      notify_business: true,
      notes: '',
    });
    this.cancellationDialogVisible.set(true);
  }

  protected closeCancellationDialog(): void {
    this.cancellationDialogVisible.set(false);
    this.cancellationGuide.set(null);
    this.cancellationError.set('');
  }

  protected submitCancellation(): void {
    if (this.cancellationForm.invalid) {
      this.cancellationForm.markAllAsTouched();
      return;
    }

    const payload = this.cancellationForm.getRawValue();
    if (payload.guide_id == null || payload.cancellation_type_id == null) {
      this.cancellationError.set('Selecciona la guía y el tipo de cancelación.');
      return;
    }

    this.submittingCancellation.set(true);
    this.cancellationError.set('');

    this.api
      .post('/coordinator/cancellations', payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submittingCancellation.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Cancelación registrada',
            detail: 'La guía fue cancelada correctamente.',
          });
          this.closeCancellationDialog();
          this.refreshCurrent();
        },
        error: (error) => {
          this.submittingCancellation.set(false);
          const message =
            error?.message ?? 'No se pudo registrar la cancelación. Inténtalo nuevamente.';
          this.cancellationError.set(message);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        },
      });
  }

  protected hasCancellationError(
    controlName: keyof typeof this.cancellationForm.controls,
    errorCode: string
  ): boolean {
    const control = this.cancellationForm.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }

  private loadCancellationTypes(): void {
    this.api
      .get<CancellationType[]>('/coordinator/cancellation-types')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => {
          this.cancellationTypes.set(types ?? []);
        },
        error: () => {
          this.cancellationTypes.set([]);
        },
      });
  }
}

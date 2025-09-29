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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ApiService } from '../../../core/http/api.service';

interface AvailableCourier {
  courier_id: number;
  courier_name: string;
  assigned_count: number;
  completed_count: number;
  pending_count: number;
  incidents_count: number;
  has_active_contract: boolean;
  completion_rate: number;
}

interface PendingDeliveryItem {
  guide_id: number;
  guide_number: string;
  business_name: string;
  recipient_name: string;
  current_state: string;
  created_at: string;
  assigned_courier: string | null;
  priority: string | null;
}

interface PendingDeliveryResponse {
  content: PendingDeliveryItem[];
}

interface CreateAssignmentPayload {
  guide_id: number;
  courier_id: number;
  assignment_criteria: string;
  priority: string;
  observations: string;
  estimated_hours: number;
  force_assignment: boolean;
}

@Component({
  selector: 'app-create-assignment-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    TextareaModule,
    InputNumberModule,
    InputTextModule,
    ToggleSwitchModule,
    ButtonModule,
    ToastModule,
    AutoCompleteModule,
    SelectModule,
  ],
  templateUrl: './create-assignment-page.html',
  styleUrl: './create-assignment-page.css',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAssignmentPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);

  protected readonly loadingCouriers = signal(false);
  protected readonly loadingGuides = signal(false);
  protected readonly submitting = signal(false);
  protected couriers: AvailableCourier[] = [];
  protected courierSuggestions: AvailableCourier[] = [];
  protected guides: PendingDeliveryItem[] = [];
  protected guideSuggestions: PendingDeliveryItem[] = [];
  protected readonly loadError = signal('');
  protected readonly submitError = signal('');

  protected readonly assignmentCriteriaOptions = [
    { label: 'Selección Manual', value: 'MANUAL_SELECTION' },
    { label: 'Balance de carga', value: 'LOAD_BALANCING' },
    { label: 'Prioridad forzada', value: 'PRIORITY_OVERRIDE' },
  ];

  protected readonly priorityOptions = [
    { label: 'Alta', value: 'HIGH' },
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Baja', value: 'LOW' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    guide_id: [null as number | null, [Validators.required]],
    courier_id: [null as number | null, [Validators.required]],
    assignment_criteria: ['MANUAL_SELECTION', [Validators.required]],
    priority: ['NORMAL', [Validators.required]],
    observations: [''],
    estimated_hours: [2, [Validators.required, Validators.min(0)]],
    force_assignment: [false],
  });

  protected readonly isLoading = computed(() => this.loadingCouriers() || this.loadingGuides());

  ngOnInit(): void {
    this.loadOptions();
  }

  protected loadOptions(): void {
    this.fetchPendingDeliveries();
    this.fetchCouriers();
  }

  protected searchGuides(event: { query: string }): void {
    const query = (event.query || '').trim().toLowerCase();
    if (!query) {
      this.guideSuggestions = [...this.guides];
      return;
    }

    this.guideSuggestions = this.guides.filter((guide) => {
      const numberMatch = guide.guide_number.toLowerCase().includes(query);
      const businessMatch = guide.business_name.toLowerCase().includes(query);
      const recipientMatch = guide.recipient_name.toLowerCase().includes(query);
      const idMatch = guide.guide_id.toString().includes(query);
      return numberMatch || businessMatch || recipientMatch || idMatch;
    });
  }

  protected searchCouriers(event: { query: string }): void {
    const query = (event.query || '').trim().toLowerCase();
    if (!query) {
      this.courierSuggestions = [...this.couriers];
      return;
    }

    this.courierSuggestions = this.couriers.filter((courier) => {
      const matchesName = courier.courier_name.toLowerCase().includes(query);
      const matchesId = courier.courier_id.toString().includes(query);
      return matchesName || matchesId;
    });
  }

  protected submitAssignment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set('');
    this.submitting.set(true);

    const raw = this.form.getRawValue();
    if (raw.guide_id === null || raw.courier_id === null) {
      this.submitting.set(false);
      this.submitError.set('Selecciona una guía y un courier antes de continuar.');
      return;
    }

    const payload: CreateAssignmentPayload = {
      guide_id: raw.guide_id,
      courier_id: raw.courier_id,
      assignment_criteria: raw.assignment_criteria,
      priority: raw.priority,
      observations: raw.observations,
      estimated_hours: raw.estimated_hours,
      force_assignment: raw.force_assignment,
    };

    console.log('Payload to submit:', payload);
    this.api
      .post('/coordinator/assignments', payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Asignación creada',
            detail: 'La guía fue asignada correctamente al courier seleccionado.',
          });
          this.form.reset({
            guide_id: null,
            courier_id: null,
            assignment_criteria: 'MANUAL_SELECTION',
            priority: 'NORMAL',
            observations: '',
            estimated_hours: 2,
            force_assignment: false,
          });
          this.fetchPendingDeliveries(true);
          this.fetchCouriers(true);
        },
        error: (error) => {
          this.submitting.set(false);
          const message = error?.message ?? 'No se pudo crear la asignación. Inténtalo nuevamente.';
          this.submitError.set(message);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        },
      });
  }

  protected hasError(controlName: keyof typeof this.form.controls, errorCode: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }

  private fetchPendingDeliveries(force = false): void {
    if (force) {
      this.loadError.set('');
    }
    this.loadingGuides.set(true);
    this.api
      .get<PendingDeliveryResponse>('/coordinator/deliveries/pending')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.guides = response?.content ?? [];
          this.guideSuggestions = [...this.guides];
          this.loadingGuides.set(false);
        },
        error: (error) => {
          const message = error?.message ?? 'No se pudieron cargar las guías pendientes.';
          this.loadError.set(message);
          this.guides = [];
          this.guideSuggestions = [];
          this.loadingGuides.set(false);
        },
      });
  }

  private fetchCouriers(force = false): void {
    if (force) {
      this.loadError.set('');
    }
    this.loadingCouriers.set(true);
    this.api
      .get<AvailableCourier[]>('/coordinator/couriers/available')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (couriers) => {
          this.couriers = couriers ?? [];
          this.courierSuggestions = [...this.couriers];
          this.loadingCouriers.set(false);
        },
        error: (error) => {
          const message = error?.message ?? 'No se pudieron cargar los couriers disponibles.';
          this.loadError.set(message);
          this.couriers = [];
          this.courierSuggestions = [];
          this.loadingCouriers.set(false);
        },
      });
  }
}

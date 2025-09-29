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
import { ButtonModule } from 'primeng/button';
// import { InputSwitchModule } from 'primeng/inputswitch';
// import { DropdownModule } from 'primeng/dropdown';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../../core/http/api.service';
import { SelectModule } from 'primeng/select';

interface PendingGuide {
  guide_id: number;
  guide_number: string;
  business_name: string;
  recipient_name: string;
  current_state: string;
  created_at: string;
}

interface PendingGuideResponse {
  content: PendingGuide[];
}

interface IncidentTypeItem {
  incident_type_id: number;
  incident_type_name: string;
  severity: string;
}

interface CreateIncidentPayload {
  guide_id: number;
  incident_type_id: number;
  description: string;
  immediate_action: string;
  suggested_resolution: string;
  severity: string;
  requires_immediate_return: boolean;
  customer_contacted: boolean;
}

@Component({
  selector: 'app-create-incident-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    TextareaModule,
    ToggleSwitchModule,
    ButtonModule,
    ToastModule,
    SelectModule
  ],
  templateUrl: './create-incident-page.html',
  styleUrl: './create-incident-page.css',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateIncidentPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);

  protected readonly loadingGuides = signal(false);
  protected readonly loadingIncidentTypes = signal(false);
  protected readonly submitting = signal(false);
  protected guides: PendingGuide[] = [];
  protected guideSuggestions: PendingGuide[] = [];
  protected incidentTypes: IncidentTypeItem[] = [];
  protected incidentTypeSuggestions: IncidentTypeItem[] = [];
  protected readonly loadError = signal('');
  protected readonly submitError = signal('');

  protected readonly severityOptions = [
    { label: 'Baja', value: 'LOW' },
    { label: 'Media', value: 'MEDIUM' },
    { label: 'Alta', value: 'HIGH' },
    { label: 'Crítica', value: 'CRITICAL' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    guide_id: [null as number | null, [Validators.required]],
    incident_type_id: [null as number | null, [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    immediate_action: ['', [Validators.required, Validators.minLength(5)]],
    suggested_resolution: ['', [Validators.required, Validators.minLength(5)]],
    severity: ['MEDIUM', [Validators.required]],
    requires_immediate_return: [false],
    customer_contacted: [false],
  });

  protected readonly isLoading = computed(
    () => this.loadingGuides() || this.loadingIncidentTypes()
  );

  ngOnInit(): void {
    this.loadOptions();

    this.form.controls.incident_type_id.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((typeId) => {
        if (typeId == null) return;
        const match = this.incidentTypes.find((type) => type.incident_type_id === typeId);
        if (match && match.severity) {
          this.form.controls.severity.setValue(match.severity, { emitEvent: false });
        }
      });
  }

  protected loadOptions(): void {
    this.fetchPendingGuides();
    this.fetchIncidentTypes();
  }

  protected searchGuides(event: { query: string }): void {
    const query = (event.query || '').trim().toLowerCase();
    if (!query) {
      this.guideSuggestions = [...this.guides];
      return;
    }

    this.guideSuggestions = this.guides.filter((guide) => {
      const matchesNumber = guide.guide_number.toLowerCase().includes(query);
      const matchesBusiness = guide.business_name.toLowerCase().includes(query);
      const matchesRecipient = guide.recipient_name.toLowerCase().includes(query);
      const matchesId = guide.guide_id.toString().includes(query);
      return matchesNumber || matchesBusiness || matchesRecipient || matchesId;
    });
  }

  protected searchIncidentTypes(event: { query: string }): void {
    const query = (event.query || '').trim().toLowerCase();
    if (!query) {
      this.incidentTypeSuggestions = [...this.incidentTypes];
      return;
    }

    this.incidentTypeSuggestions = this.incidentTypes.filter((type) => {
      const nameMatch = type.incident_type_name.toLowerCase().includes(query);
      const idMatch = type.incident_type_id.toString().includes(query);
      return nameMatch || idMatch;
    });
  }

  protected submitIncident(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set('');
    const raw = this.form.getRawValue();
    if (raw.guide_id === null || raw.incident_type_id === null) {
      this.submitError.set('Selecciona una guía y un tipo de incidente antes de continuar.');
      return;
    }

    this.submitting.set(true);

    const payload: CreateIncidentPayload = {
      guide_id: raw.guide_id,
      incident_type_id: raw.incident_type_id,
      description: raw.description,
      immediate_action: raw.immediate_action,
      suggested_resolution: raw.suggested_resolution,
      severity: raw.severity,
      requires_immediate_return: raw.requires_immediate_return,
      customer_contacted: raw.customer_contacted,
    };

    this.api
      .post('/coordinator/incidents', payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Incidente registrado',
            detail: 'El incidente se registró correctamente.',
          });
          this.form.reset({
            guide_id: null,
            incident_type_id: null,
            description: '',
            immediate_action: '',
            suggested_resolution: '',
            severity: 'MEDIUM',
            requires_immediate_return: false,
            customer_contacted: false,
          });
          this.fetchPendingGuides(true);
          this.fetchIncidentTypes(true);
        },
        error: (error) => {
          this.submitting.set(false);
          const message = error?.message ?? 'No se pudo registrar el incidente.';
          this.submitError.set(message);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        },
      });
  }

  protected hasError(controlName: keyof typeof this.form.controls, errorCode: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }

  private fetchPendingGuides(force = false): void {
    if (force) this.loadError.set('');
    this.loadingGuides.set(true);

    this.api
      .get<PendingGuideResponse>('/coordinator/deliveries/pending')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.guides = response?.content ?? [];
          this.guideSuggestions = [...this.guides];
          this.loadingGuides.set(false);
        },
        error: (error) => {
          const message =
            error?.message ?? 'No se pudieron cargar las guías disponibles para incidentes.';
          this.loadError.set(message);
          this.guides = [];
          this.guideSuggestions = [];
          this.loadingGuides.set(false);
        },
      });
  }

  private fetchIncidentTypes(force = false): void {
    if (force) this.loadError.set('');
    this.loadingIncidentTypes.set(true);

    this.api
      .get<IncidentTypeItem[]>('/coordinator/incident-types')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => {
          this.incidentTypes = types ?? [];
          this.incidentTypeSuggestions = [...this.incidentTypes];
          this.loadingIncidentTypes.set(false);
        },
        error: (error) => {
          const message =
            error?.message ?? 'No se pudieron cargar los tipos de incidentes disponibles.';
          this.loadError.set(message);
          this.incidentTypes = [];
          this.incidentTypeSuggestions = [];
          this.loadingIncidentTypes.set(false);
        },
      });
  }
}

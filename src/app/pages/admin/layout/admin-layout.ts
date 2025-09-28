// src/app/pages/admin/layout/admin-layout.ts
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { ConfirmDialog } from '../../../shared/confirm/confirm-dialog';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterOutlet, NgIf, ConfirmDialog, ButtonModule, TooltipModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">
      <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div class="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <a routerLink="/admin" class="font-black tracking-tight">SIE · Admin</a>

          <!-- Main nav -->
          <nav class="hidden md:flex items-center gap-4 text-sm">
            <a routerLink="dashboard" class="hover:text-indigo-600">Dashboard</a>
            <a routerLink="branches" class="hover:text-indigo-600">Sucursales</a>
            <a routerLink="users" class="hover:text-indigo-600">Usuarios</a>
            <a routerLink="contracts" class="hover:text-indigo-600">Contratos</a>
            <a routerLink="loyalty" class="hover:text-indigo-600">Fidelización</a>
            <a routerLink="businesses" class="hover:text-indigo-600">Comercios</a>
            <a routerLink="audit" class="hover:text-indigo-600">Auditoría</a>
            <a routerLink="config" class="hover:text-indigo-600">Config</a>

            <!-- CTA: Hiring wizard -->
            <a
              routerLink="hiring/new"
              class="ml-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Contratar
            </a>
            <div class="space-x-4">
              <!-- <p-button variant="outlined" label="Inicia sesión"></p-button>
      <p-button label="Regístrate"></p-button> -->

              @if (authService.user()) {
              <div class="flex items-center gap-2 text-primary-emphasis">
                <a
                  class="font-semibold hover:text-primary-emphasis"
                  [routerLink]="'/admin/profile'"
                >
                  @if (!authService.user()?.first_name && !authService.user()?.last_name) {
                  {{ authService.user()?.full_name }}
                  } @else {
                  {{ authService.user()?.first_name }} {{ authService.user()?.last_name }}
                  }
                </a>
                <p-button
                  icon="pi pi-sign-out"
                  (click)="authService.logout()"
                  size="small"
                  variant="text"
                  pTooltip="Cerrar sesión"
                  tooltipPosition="top"
                />
              </div>
              }
            </div>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6">
        <router-outlet />
      </main>

      <app-confirm-dialog />
    </div>
  `,
})
export class AdminLayout {
  readonly authService = inject(AuthService);
}

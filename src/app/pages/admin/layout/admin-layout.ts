// src/app/pages/admin/layout/admin-layout.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterOutlet, NgIf],
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
              class="ml-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              Contratar
            </a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayout {}

import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <h1 class="text-xl font-bold mb-4">Dashboard</h1>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="rounded border bg-white p-4">
        <div class="text-sm text-slate-500">Entregas hoy</div>
        <div class="text-2xl font-bold">0</div>
      </div>
      <div class="rounded border bg-white p-4">
        <div class="text-sm text-slate-500">Canceladas hoy</div>
        <div class="text-2xl font-bold">0</div>
      </div>
      <div class="rounded border bg-white p-4">
        <div class="text-sm text-slate-500">Rechazadas hoy</div>
        <div class="text-2xl font-bold">0</div>
      </div>
    </div>
  `,
})
export class Dashboard {}

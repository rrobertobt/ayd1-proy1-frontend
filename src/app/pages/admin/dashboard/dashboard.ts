import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <section class="max-w-6xl mx-auto">
      <header class="mb-6">
        <h1 class="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-1">Resumen general (demo visual).</p>
      </header>

      <!-- KPI cards -->
      <div class="grid gap-4 md:grid-cols-5">
        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm text-slate-500">Entregas hoy</div>
              <div class="text-3xl font-black mt-1">{{ summary.deliveriesToday }}</div>
            </div>
            <div class="h-10 w-10 rounded-lg grid place-items-center bg-indigo-50 text-indigo-600">🚚</div>
          </div>
          <div class="mt-4 h-12 flex items-end gap-1.5">
            <div
              *ngFor="let v of weekSeries"
              class="w-2 rounded bg-indigo-500"
              [style.height.px]="(v / weekMax) * 48"
            ></div>
          </div>
          <div class="text-xs text-slate-500 mt-2">Últimos 7 días</div>
        </div>

        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm text-slate-500">Canceladas hoy</div>
              <div class="text-3xl font-black mt-1">{{ summary.cancelledToday }}</div>
            </div>
            <div class="h-10 w-10 rounded-lg grid place-items-center bg-rose-50 text-rose-600">✖️</div>
          </div>
          <div class="mt-4 text-xs text-rose-600 bg-rose-50 inline-flex px-2 py-1 rounded-full">
            Riesgo bajo
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm text-slate-500">Rechazadas hoy</div>
              <div class="text-3xl font-black mt-1">{{ summary.rejectedToday }}</div>
            </div>
            <div class="h-10 w-10 rounded-lg grid place-items-center bg-amber-50 text-amber-600">⚠️</div>
          </div>
          <div class="mt-4 text-xs text-amber-700 bg-amber-50 inline-flex px-2 py-1 rounded-full">
            Monitorear
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm text-slate-500">A tiempo</div>
              <div class="text-3xl font-black mt-1">{{ summary.onTimeRate }}%</div>
            </div>
            <div
              class="h-16 w-16 rounded-full grid place-items-center"
              [style.background]="
                'conic-gradient(#4f46e5 ' + summary.onTimeRate + '%, #e2e8f0 0)'
              "
            >
              <div class="h-12 w-12 rounded-full bg-white grid place-items-center text-xs text-slate-600">
                SLA
              </div>
            </div>
          </div>
          <div class="mt-4 text-xs text-slate-500">Meta &gt; 92%</div>
        </div>

        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm text-slate-500">Tiempo promedio</div>
              <div class="text-3xl font-black mt-1">{{ summary.avgMins }} min</div>
            </div>
            <div class="h-10 w-10 rounded-lg grid place-items-center bg-emerald-50 text-emerald-600">⏱️</div>
          </div>
          <div class="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="h-2 bg-emerald-500 rounded-full" [style.width.%]="(summary.avgMins / 60) * 100"></div>
          </div>
          <div class="mt-1 text-xs text-slate-500">Objetivo: &lt; 45 min</div>
        </div>
      </div>

      <!-- Secondary content -->
      <div class="grid gap-4 md:grid-cols-2 mt-6">
        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold">Top repartidores</h2>
            <span class="text-xs text-slate-500">demo</span>
          </div>
          <div class="divide-y">
            <div *ngFor="let c of topCouriers" class="py-2 flex items-center justify-between">
              <div>
                <div class="font-medium">{{ c.name }}</div>
                <div class="text-xs text-slate-500">Entregas: {{ c.deliveries }}</div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-xs text-slate-500">On-time</div>
                <div class="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="h-2 bg-indigo-500" [style.width.%]="c.ontime"></div>
                </div>
                <div class="text-sm font-semibold">{{ c.ontime }}%</div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold">Top comercios</h2>
            <span class="text-xs text-slate-500">demo</span>
          </div>
          <div class="divide-y">
            <div *ngFor="let b of topBusinesses" class="py-2 flex items-center justify-between">
              <div>
                <div class="font-medium">{{ b.name }}</div>
                <div class="text-xs text-slate-500">Pedidos: {{ b.orders }}</div>
              </div>
              <div class="flex items-center gap-2 text-amber-500">
                <span class="text-sm font-semibold">{{ b.rating }}</span>
                <span>⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Dashboard {
  summary = {
    deliveriesToday: 128,
    cancelledToday: 4,
    rejectedToday: 2,
    onTimeRate: 94,
    avgMins: 37,
  };

  weekSeries = [82, 96, 110, 75, 132, 148, 120];
  get weekMax(): number { return Math.max(...this.weekSeries, 1); }

  topCouriers = [
    { name: 'María López', deliveries: 56, ontime: 98 },
    { name: 'Carlos Pérez', deliveries: 49, ontime: 95 },
    { name: 'Ana García', deliveries: 43, ontime: 96 },
  ];

  topBusinesses = [
    { name: 'Electrónica Moderna', orders: 120, rating: 4.8 },
    { name: 'Boutique Fashion', orders: 96, rating: 4.6 },
    { name: 'Mini Market 24/7', orders: 88, rating: 4.5 },
  ];
}

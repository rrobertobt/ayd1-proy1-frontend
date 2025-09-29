import { Routes } from '@angular/router';

export const OPS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../pages/ops/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../pages/ops/profile-page/profile-page').then((m) => m.OpsProfilePage),
  },
  {
    path: 'deliveries',
    loadComponent: () =>
      import('../pages/ops/deliveries-page/deliveries-page').then((m) => m.DeliveriesPage),
  },
];

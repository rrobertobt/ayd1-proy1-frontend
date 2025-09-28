// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DefaultLayout } from './default-layout/default-layout';
import { LandingPage } from './pages/landing-page/landing-page';
import { AboutPage } from './pages/about-page/about-page';
import { LoginPage } from './pages/login-page/login-page';
import {
  redirectIfAuthenticatedGuard,
  roleCanActivateGuard,
  roleCanMatchGuard,
} from './core/auth/auth.guards';
import { PrivateOpsLayout } from './layouts/private-ops-layout/private-ops-layout';
import { AdminLayout } from './pages/admin/layout/admin-layout';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [redirectIfAuthenticatedGuard],
  },
  {
    path: '',
    component: DefaultLayout,
    children: [
      { path: '', component: LandingPage },
      { path: 'about', component: AboutPage },
    ],
  },
  {
    path: 'admin', // administrador
    component: AdminLayout,
    canMatch: [roleCanMatchGuard],
    canActivate: [roleCanActivateGuard],
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'ops', // coordinador/operaciones
    component: PrivateOpsLayout,
    canMatch: [roleCanMatchGuard],
    canActivate: [roleCanActivateGuard],
    loadChildren: () => import('./routes/ops.routes').then((m) => m.OPS_ROUTES),
  },
];

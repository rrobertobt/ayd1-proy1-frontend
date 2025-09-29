import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';
import { AdminProfilePage } from './profile-page/profile-page';

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },

  // Sucursales
  {
    path: 'branches',
    loadComponent: () => import('./branches/branch-list').then((m) => m.BranchList),
  },
  {
    path: 'branches/new',
    loadComponent: () => import('./branches/branch-form').then((m) => m.BranchForm),
  },
  {
    path: 'branches/:id',
    loadComponent: () => import('./branches/branch-form').then((m) => m.BranchForm),
  },

  // Usuarios
  { path: 'users', loadComponent: () => import('./users/user-list').then((m) => m.UserList) },
  { path: 'users/new', loadComponent: () => import('./users/user-form').then((m) => m.UserForm) },
  { path: 'users/:id', loadComponent: () => import('./users/user-form').then((m) => m.UserForm) },

  // Contratos
  {
    path: 'contracts',
    loadComponent: () => import('./contracts/contract-list').then((m) => m.ContractList),
  },
  {
    path: 'contracts/new',
    loadComponent: () => import('./contracts/contract-form').then((m) => m.ContractForm),
  },
  {
    path: 'contracts/:id',
    loadComponent: () => import('./contracts/contract-form').then((m) => m.ContractForm),
  },
  {
    path: 'hiring/new',
    loadComponent: () => import('./hiring/hire-wizard').then((m) => m.HireWizard),
  },
  {
    path: 'users/:id/contracts',
    loadComponent: () => import('./hiring/contract-history').then((m) => m.ContractHistory),
  },

  // Fidelización
  {
    path: 'loyalty',
    loadComponent: () => import('./loyalty/loyalty-list').then((m) => m.LoyaltyList),
  },
  {
    path: 'loyalty/new',
    loadComponent: () => import('./loyalty/loyalty-form').then((m) => m.LoyaltyForm),
  },
  {
    path: 'loyalty/:id',
    loadComponent: () => import('./loyalty/loyalty-form').then((m) => m.LoyaltyForm),
  },

  // Comercios
  {
    path: 'businesses',
    loadComponent: () => import('./businesses/business-list').then((m) => m.BusinessList),
  },
  {
    path: 'businesses/new',
    loadComponent: () => import('./businesses/business-form').then((m) => m.BusinessForm),
  },
  {
    path: 'businesses/:id',
    loadComponent: () => import('./businesses/business-form').then((m) => m.BusinessForm),
  },

  // Auditoría
  { path: 'audit', loadComponent: () => import('./audit/audit-log').then((m) => m.AuditLog) },

  // Configuración
  {
    path: 'config',
    loadComponent: () => import('./config/system-config').then((m) => m.SystemConfig),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile-page/profile-page').then((m) => m.AdminProfilePage),
  },
];

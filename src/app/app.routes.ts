// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DefaultLayout } from './default-layout/default-layout';
import { LandingPage } from './pages/landing-page/landing-page';
import { AboutPage } from './pages/about-page/about-page';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayout,
    children: [
      { path: '', component: LandingPage },
      { path: 'about', component: AboutPage },


      {
        path: 'admin',
        loadChildren: () =>
          import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
      },
    ],
  },
  {
    path: 'ops', // coordinador/operaciones
    loadChildren: () => import('./routes/ops.routes').then((m) => m.OPS_ROUTES),
  },
];

import { Routes } from '@angular/router';
import { PrivateOpsLayout } from '../layouts/private-ops-layout/private-ops-layout';
import { OpsProfilePage } from '../pages/ops/profile-page/profile-page';
import { OpsHomePage } from '../pages/ops/ops-home-page/ops-home-page';

export const OPS_ROUTES: Routes = [
  {
    path: '',
    component: OpsHomePage,
  },
  {
    path: 'profile',
    component: OpsProfilePage,
  }
];

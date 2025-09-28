import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroHome, heroUserCircle } from '@ng-icons/heroicons/outline';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-ops-top-nav',
  imports: [ButtonModule, RouterLink, NgIcon, TooltipModule, RouterLinkActive],
  viewProviders: [provideIcons({ heroHome, heroUserCircle })],
  templateUrl: './ops-top-nav.html',
  styleUrl: './ops-top-nav.css',
})
export class OpsTopNav {
  readonly authService = inject(AuthService);

  menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'heroHome',
      routerLink: '/ops',
    },
    {
      label: '',
      routerLink: '/ops/',
    },
  ];
}

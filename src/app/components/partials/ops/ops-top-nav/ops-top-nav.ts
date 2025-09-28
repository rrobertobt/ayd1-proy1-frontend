import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroHome } from '@ng-icons/heroicons/outline';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-ops-top-nav',
  imports: [ButtonModule, RouterLink, Menubar, NgIcon],
  viewProviders: [provideIcons({ heroHome })],
  templateUrl: './ops-top-nav.html',
  styleUrl: './ops-top-nav.css',
})
export class OpsTopNav {
  menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'heroHome',
      routerLink: '/',
    },
    {
      label: 'Acerca de',
      routerLink: '/about',
    },
  ];
}

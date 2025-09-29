import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroHome } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-default-top-nav',
  imports: [ButtonModule, RouterLink, Menubar, NgIcon],
  viewProviders: [provideIcons({ heroHome })],
  templateUrl: './default-top-nav.html',
  styleUrl: './default-top-nav.css',
})
export class DefaultTopNav {
  menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'heroHome',
      routerLink: '/',
    },
    {
      label: 'Acerca de',
      routerLink: '/about',
    }
  ];
}

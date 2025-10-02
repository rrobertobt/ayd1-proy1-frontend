import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowRight } from '@ng-icons/heroicons/outline';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-landing-page',
  imports: [ButtonModule, NgIcon, RouterLink],
  templateUrl: './landing-page.html',
  viewProviders: [
    provideIcons({
      heroArrowRight,
    }),
  ],
  styleUrl: './landing-page.css',
})
export class LandingPage {}

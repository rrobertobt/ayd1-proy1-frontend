import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import { definePreset } from '@primeuix/themes';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        // preset: Aura,
        preset: definePreset(Lara, {
          semantic: {
            primary: {
              50: '{rose.50}',
              100: '{rose.100}',
              200: '{rose.200}',
              300: '{rose.300}',
              400: '{rose.400}',
              500: '{rose.500}',
              600: '{rose.600}',
              700: '{rose.700}',
              800: '{rose.800}',
              900: '{rose.900}',
              950: '{rose.950}',
            },
          },
        }),
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
};

import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  // providers: [provideRouter(routes), provideClientHydration(), provideAnimations()]
  providers: [provideRouter(routes, withHashLocation()), provideClientHydration(), provideAnimations()]
};

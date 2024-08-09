import { Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PlaygroundComponent } from './views/playground/playground.component';

export const routes: Routes = [
  {
    path: 'playground',
    component: PlaygroundComponent,
    // outlet: ''
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: AppComponent,
  },
  {
    path: '**',
    redirectTo: ''
  },
];

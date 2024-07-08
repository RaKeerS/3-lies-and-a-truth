import { Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PlaygroundComponent } from './views/playground/playground.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent
  },
  {
    path: 'playground',
    component: PlaygroundComponent,
    // outlet: ''
  },
  {
    path: 'home',
    component: AppComponent
  }
];

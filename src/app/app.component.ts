import { Component, Injector } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { PrimeNgModule } from './prime-ng/prime-ng.module';
import { PlaygroundService } from './services/playground.service';
import { GameRulesComponent } from './views/game-rules/game-rules.component';
import { GameConnectorDialogComponent } from './views/modal-dialogs/game-connector-dialog/game-connector-dialog.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, PrimeNgModule, GameConnectorDialogComponent, GameRulesComponent],
    providers: [DialogService, MessageService, PlaygroundService, ConfirmationService]
})
export class AppComponent {
  title = '3-lies-and-a-truth';

  createPlayground: boolean = false;
  nextStage = false;
  showPlaygroundDialog: boolean = false;
  showTokenDialog: boolean = false;
  playerName: string = '';
  playgroundId?: number;
  token: string = '';

  private _playgroundService: PlaygroundService;

  constructor(injector: Injector) {
    this._playgroundService = injector.get(PlaygroundService);
  }

  get isConnected(): boolean {
    return this._playgroundService.isConnected;
  }
  get router(): Router {
    return this._playgroundService.router;
  }

  toggleDialogState(): void {
    this.showPlaygroundDialog = true;
  }

}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PrimeNgModule } from './prime-ng/prime-ng.module';
import { PlaygroundService } from './services/playground.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PrimeNgModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '3-lies-and-a-truth';
  private _playgroundService: PlaygroundService;

  visible = false;
  playerName: string = '';
  playgroundId?: number;

  constructor(playgroundService: PlaygroundService) {
    this._playgroundService = playgroundService;
  }

  showDialog(): void {
    this.visible = true;
  }

  joinExistingPlayground(): void {
    if (this.playgroundId !== undefined) {
      this._playgroundService.joinExistingPlayground(this.playgroundId, this.playerName);
    }
  }

  createNewPlayground(): void {
    if (this.playerName.trim().length > 0) {
      this._playgroundService.createNewPlayground(this.playerName);
    } else {
      // NOTE - Show Toaster
    }
  }

}

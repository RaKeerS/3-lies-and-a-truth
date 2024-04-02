import { Component } from '@angular/core';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-playground-game-rules',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './playground-game-rules.component.html',
  styleUrl: './playground-game-rules.component.scss'
})
export class PlaygroundGameRulesComponent {

  // @Output() commenceGame: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _showPlaygroundGameRulesDialog: boolean = true;

  active: number = 0;


  get showPlaygroundGameRulesDialog(): boolean {
    return this._showPlaygroundGameRulesDialog;
  }
  set showPlaygroundGameRulesDialog(value: boolean) {
    this._showPlaygroundGameRulesDialog = value;
  }

  moveToGameRound(): void {
    // this.active = 4;
    this.showPlaygroundGameRulesDialog = false;
    // this.commenceGame.emit(true);
  }


}

import { Component, Input } from '@angular/core';

import { PlaygroundGameStage } from '../../enums/playground.enum';
import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent {
  // @Input() playerName: string = 'Player 1';
  // @Input() flipCards: boolean = false;
  // @Input() playerCardsList?: Map<CardDeckEnum, string>;
  // @Input() midSegwayMessages?: string;
  // @Input() increaseZIndexCards: boolean = false;
  // @Input() increaseZIndexPicker: boolean = false;

  @Input() playgroundModel!: PlaygroundModel;

  public PlaygroundGameStage: typeof PlaygroundGameStage = PlaygroundGameStage;

  public convertString(word: string): string {
    const convertedWord = word.replaceAll('_', ' ').toLowerCase();
    return `I have ${convertedWord}`;
  }

  public handleCheckboxChange(): void {
    if(this.playgroundModel.playerFalsySelectedList.length === 4) {
      this.playgroundModel.playerFalsySelectedList.reverse();
      this.playgroundModel.playerFalsySelectedList.pop();
      // this.playgroundModel.playerFalsySelectedList.reverse();
    }
  }
}

import { Component, Input } from '@angular/core';

import { PlaygroundGameStage, PlaygroundGameStagePhase } from '../../enums/playground.enum';
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
  public PlaygroundGameStagePhase: typeof PlaygroundGameStagePhase = PlaygroundGameStagePhase;

  public convertString(word: string): string {
    const convertedWord = word.replaceAll('_', ' ').toLowerCase();
    return `I have ${convertedWord}`;
  }

  public handleCheckboxChange(gameStage: PlaygroundGameStage): void {
    if (gameStage === PlaygroundGameStage.PICK) {
      if(this.playgroundModel.playerFalsySelectedList.length === 4) {
        this.playgroundModel.playerFalsySelectedList.reverse();
        this.playgroundModel.playerFalsySelectedList.pop();
        // this.playgroundModel.playerFalsySelectedList.reverse();
      }
    } else if (gameStage === PlaygroundGameStage.CHOOSE) {
      if((this.playgroundModel.opponentFalsySelectedList as any[]).length === 4) {
        (this.playgroundModel.opponentFalsySelectedList as any[]).reverse();
        (this.playgroundModel.opponentFalsySelectedList as any[]).pop();
        // this.playgroundModel.playerFalsySelectedList.reverse();
      }
    }

  }
}

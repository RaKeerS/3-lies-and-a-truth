import { Component, Input } from '@angular/core';

import { PlaygroundGameStageEnum, PlaygroundGameStagePhaseEnum } from '../../enums/playground.enum';
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

  public PlaygroundGameStage: typeof PlaygroundGameStageEnum = PlaygroundGameStageEnum;
  public PlaygroundGameStagePhase: typeof PlaygroundGameStagePhaseEnum = PlaygroundGameStagePhaseEnum;

  public convertString(word: string): string {
    const convertedWord = word.replaceAll('_', ' ').toLowerCase();
    return `I have ${convertedWord}`;
  }

  public handleCheckboxChange(gameStage: PlaygroundGameStageEnum): void {
    if (gameStage === PlaygroundGameStageEnum.PICK) {
      if(this.playgroundModel.playerFalsySelectedList.length === 4) {
        this.playgroundModel.playerFalsySelectedList.reverse();
        this.playgroundModel.playerFalsySelectedList.pop();
        // this.playgroundModel.playerFalsySelectedList.reverse();
      }
    } else if (gameStage === PlaygroundGameStageEnum.CHOOSE) {
      if((this.playgroundModel.opponentFalsySelectedList as any[]).length === 4) {
        (this.playgroundModel.opponentFalsySelectedList as any[]).reverse();
        (this.playgroundModel.opponentFalsySelectedList as any[]).pop();
        // this.playgroundModel.playerFalsySelectedList.reverse();
      }
    }

  }
}

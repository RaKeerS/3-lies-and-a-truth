import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { PlaygroundGameStage, PlaygroundGameStagePhase } from '../../enums/playground.enum';
import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-playground-game-initiation',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './playground-game-initiation.component.html',
  styleUrl: './playground-game-initiation.component.scss'
})
export class PlaygroundGameInitiationComponent implements OnInit, OnDestroy {

  private _dynamicDialogConfig: DynamicDialogConfig;
  private _modalData: PlaygroundModel;

  public PlaygroundGameStage: typeof PlaygroundGameStage = PlaygroundGameStage;
  public PlaygroundGameTossStage: typeof PlaygroundGameStagePhase = PlaygroundGameStagePhase;

  constructor(injector: Injector) {
    this._dynamicDialogConfig = injector.get(DynamicDialogConfig);
    this._modalData = this._dynamicDialogConfig.data.playgroundModel;
  }

  ngOnInit(): void {
    // this._modalData.commenceRound();
    // this._modalData.doGameToss().subscribe();
  }

  ngOnDestroy(): void {
    this.playgroundModel.unsubscribeAll();
  }

  get playgroundModel(): PlaygroundModel {
    return this._modalData;
    // return this._playgroundService.playgroundModel;
  }

  // get switch(): boolean {
  //   return this._modalData.switch;
  // }

  // get gameTossWinnerDetails(): string {
  //   return this._modalData.gameTossWinnerDetails;
  // }

}

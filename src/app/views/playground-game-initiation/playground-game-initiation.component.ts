import { Component, Injector } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-playground-game-initiation',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './playground-game-initiation.component.html',
  styleUrl: './playground-game-initiation.component.scss'
})
export class PlaygroundGameInitiationComponent {

  private _dynamicDialogConfig: DynamicDialogConfig;
  private _gameTossWinnerDetails: string = '';
  private _modalData: any;

  constructor(injector: Injector) {
    this._dynamicDialogConfig = injector.get(DynamicDialogConfig);
    this._modalData = this._dynamicDialogConfig.data.playgroundModel;
  }

  get switch(): boolean {
    return this._modalData.switch;
  }

  get gameTossWinnerDetails(): string {
    return this._gameTossWinnerDetails;
  }

}

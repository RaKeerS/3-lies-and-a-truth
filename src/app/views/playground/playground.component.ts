import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';
import { APP_CONTAINER_FLEX_CLASS } from '../../types/app-types';
import { DeckComponent } from '../deck/deck.component';
import { MidZoneComponent } from '../mid-zone/mid-zone.component';
import { OpponentComponent } from '../opponent/opponent.component';
import { PlayerComponent } from '../player/player.component';
import { VoidZoneComponent } from '../void-zone/void-zone.component';

@Component({
    selector: 'app-playground',
    standalone: true,
    templateUrl: './playground.component.html',
    styleUrl: './playground.component.scss',
    imports: [PrimeNgModule, OpponentComponent, MidZoneComponent, PlayerComponent, DeckComponent, VoidZoneComponent]
})
export class PlaygroundComponent {

  @HostBinding(APP_CONTAINER_FLEX_CLASS)
  protected readonly containerFlex = true;

  private _playgroundMetadata: any;

  // public webSocketModel: WebSocketsModel;
  public playgroundModel: PlaygroundModel;

  constructor(private router: Router) {
    this.playgroundModel = new PlaygroundModel();
    this._playgroundMetadata = this.router.getCurrentNavigation()?.extras.state?.['playgroundMetadata'];
  }

}

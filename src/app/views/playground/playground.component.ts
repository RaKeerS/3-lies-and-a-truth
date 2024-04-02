import { Component, HostBinding, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';
import { PlaygroundService } from '../../services/playground.service';
import { APP_CONTAINER_FLEX_CLASS } from '../../types/app-types';
import { DeckComponent } from '../deck/deck.component';
import { MidZoneComponent } from '../mid-zone/mid-zone.component';
import { OpponentComponent } from '../opponent/opponent.component';
import { PlayerComponent } from '../player/player.component';
import { PlaygroundGameRulesComponent } from '../playground-game-rules/playground-game-rules.component';
import { VoidZoneComponent } from '../void-zone/void-zone.component';

@Component({
    selector: 'app-playground',
    standalone: true,
    templateUrl: './playground.component.html',
    styleUrl: './playground.component.scss',
    imports: [PrimeNgModule, OpponentComponent, MidZoneComponent, PlayerComponent, DeckComponent, VoidZoneComponent, PlaygroundGameRulesComponent]
})
export class PlaygroundComponent implements OnInit, OnDestroy {

  @HostBinding(APP_CONTAINER_FLEX_CLASS)
  protected readonly containerFlex = true;

  private readonly _playgroundId: number;
  // private readonly _playgroundSubject: BehaviorSubject<PlayGroundMetadata>;
  private _subscription?: Subscription;

  private _router: Router
  private _playgroundService: PlaygroundService;

  // public webSocketModel: WebSocketsModel;
  public playgroundModel: PlaygroundModel;

  constructor(injector: Injector) {
    this._router = injector.get(Router);
    this._playgroundService = injector.get(PlaygroundService);
    this.playgroundModel = new PlaygroundModel(this._playgroundService);
    this._playgroundId = this._router.getCurrentNavigation()?.extras.state?.['playgroundId'];
    // this._playgroundSubject = PlaygroundService.playgroundMap.get(this._playgroundId)?.playgroundSubject!;
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }

  ngOnInit(): void {
    // this._subscription = this._playgroundSubject.subscribe(value => console.log('Playground Component: ', value));
  }

  sendMessage(): void {
    // this._playgroundService.webRtcModel.playerName === 'Player 1' ?
    // this._playgroundService.webRtcModel.sendMessageWebRtc('Ohayo, Sekai!') :
    // this._playgroundService.webRtcModel.sendMessageWebRtc('Good Morning World!!');
  }

}

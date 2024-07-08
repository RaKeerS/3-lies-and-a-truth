import { Component, ElementRef, HostBinding, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { PlaygroundGameStageEnum } from '../../enums/playground.enum';
import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';
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
    imports: [PrimeNgModule, OpponentComponent, MidZoneComponent, PlayerComponent, DeckComponent, VoidZoneComponent, PlaygroundGameRulesComponent],
    providers: [DialogService]
})
export class PlaygroundComponent implements OnInit, OnDestroy {

  @ViewChild('cardDeckShuffleList') cardList?: ElementRef;

  public PlaygroundGameStage: typeof PlaygroundGameStageEnum = PlaygroundGameStageEnum;

  @HostBinding(APP_CONTAINER_FLEX_CLASS)
  protected readonly containerFlex = true;

  private readonly _playgroundId: number;
  // private readonly _playgroundSubject: BehaviorSubject<PlayGroundMetadata>;

  private _subscription?: Subscription;

  private _router: Router
  // private _playgroundService: PlaygroundService;

  // public webSocketModel: WebSocketsModel;
  private _playgroundModel: PlaygroundModel;

  constructor(injector: Injector) {
    this._router = injector.get(Router);
    // this._playgroundService = injector.get(PlaygroundService);
    this._playgroundModel = new PlaygroundModel(injector);
    this._playgroundId = this._router.getCurrentNavigation()?.extras.state?.['playgroundId'];

    // this._playgroundSubject = PlaygroundService.playgroundMap.get(this._playgroundId)?.playgroundSubject!;
  }

  // ngAfterViewInit(): void {
  //   of({}).pipe(delay(2000), tap(() => { this.cardList?.nativeElement.classList.add('is-animated'); })).subscribe();
  //   // this.cardList?.nativeElement.classList.add('is-animated');
  // }

  ngOnDestroy(): void {
    // this._subscription?.unsubscribe();
    this.playgroundModel.dialogRef?.close();
  }

  ngOnInit(): void {
    if (!this.playgroundModel.isConnected) {
      this._router.navigate(['home']);
    } else {
      // NOTE: Commented below line for testing 'card-deck-shuffle' animation
      this.playgroundModel.showPlaygroundGameRulesDialog();
    }

    // this._subscription = this._playgroundSubject.subscribe(value => console.log('Playground Component: ', value));
  }

  get playgroundModel(): PlaygroundModel {
    return this._playgroundModel;
    // return this._playgroundService.playgroundModel;
  }

  get isShuffleDeckInitiated(): boolean {
    if (this.playgroundModel.isShuffleDeckInitiated && this.cardList) {
      this.cardList?.nativeElement.classList.add('is-animated');
    }
    return this.playgroundModel.isShuffleDeckInitiated;
  }

  sendMessage(): void {
    // this._playgroundService.webRtcModel.playerName === 'Player 1' ?
    // this._playgroundService.webRtcModel.sendMessageWebRtc('Ohayo, Sekai!') :
    // this._playgroundService.webRtcModel.sendMessageWebRtc('Good Morning World!!');
  }



}

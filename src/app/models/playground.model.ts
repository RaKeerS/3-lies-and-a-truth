import { Injector } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  BehaviorSubject,
  concat,
  delay,
  filter,
  forkJoin,
  interval,
  merge,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';

import { PlaygroundGameStage, PlaygroundGameTossStage, PlaygroundTossOutcome } from '../enums/playground.enum';
import { PlaygroundService } from '../services/playground.service';
import { GameMidSegwayMetadata } from '../types/app-types';
import { PlaygroundGameInitiationComponent } from '../views/playground-game-initiation/playground-game-initiation.component';
import { PlaygroundGameRulesComponent } from '../views/playground-game-rules/playground-game-rules.component';

export class PlaygroundModel {

  private _dialogService: DialogService
  private _dialogRef: DynamicDialogRef | undefined;

  private _gameToss: boolean = true;
  private _gameTossWinnerDetails: string = '';
  private _playerOrder: Map<string, number> = new Map<string, number>();

  private _playgroundService: PlaygroundService;

  private _playerOneBetAmount: number = 0;
  private _playerTwoBetAmount: number = 0;

  private _gameStages: Map<PlaygroundGameStage, boolean> = new Map<PlaygroundGameStage, boolean>();

  private _gameStage: BehaviorSubject<PlaygroundGameStage> = new BehaviorSubject<PlaygroundGameStage>(PlaygroundGameStage.RULES);

  private _subscription: Subscription;

  constructor(injector: Injector) {
    this._subscription = this.commenceRound().subscribe();
    this._playgroundService = injector.get(PlaygroundService);
    // this._playgroundService = playgroundService;
    this._dialogService = injector.get( DialogService);
  }

  get dialogRef(): DynamicDialogRef | undefined {
    return this._dialogRef;
  }

  get gameStage$(): Observable<PlaygroundGameStage> {
    return this._gameStage.asObservable();
  }

  get gameStages(): Map<PlaygroundGameStage, boolean> {
    return this._gameStages;
  }

  get gameStageToss() {
    return of(this.gameStages.get(PlaygroundGameStage.TOSS));
  }

  get gameStageBet(): boolean | undefined {
    return this.gameStages.get(PlaygroundGameStage.BET);
  }

  get gameToss(): boolean {
    return this._gameToss;
  }
  set gameToss(value: boolean) {
    this._gameToss = value;
  }

  get gameTossWinnerDetails(): string {
    return this._gameTossWinnerDetails;
  }

  get playerOrder(): Map<string, number> {
    return this._playerOrder;
  }

  get playerOneBetAmount(): number { // Use for data-binding with HTML
    return this._playerOneBetAmount;
  }
  set playerOneBetAmount(value: number) {
    this._playerOneBetAmount = value;
  }

  get playerTwoBetAmount(): number { // Use for data-binding with HTML
    return this._playerTwoBetAmount;
  }
  set playerTwoBetAmount(value: number) {
    this._playerTwoBetAmount = value;
  }

  get switch$(): Observable<GameMidSegwayMetadata | undefined> {
    return this._playgroundService.switch$;
  }

  get tossCompleted$(): Observable<GameMidSegwayMetadata> {
    return this._playgroundService.tossCompleted$;
  }

  private showPlaygroundGameInitiationDialog(): void { // TODO: Redefine this method for perform Toss for the match, add new component
    this.gameStages.set(PlaygroundGameStage.TOSS, true);
    this._gameStage.next(PlaygroundGameStage.TOSS);

    this._dialogRef = this._dialogService.open(PlaygroundGameInitiationComponent, {
      header: 'Game Toss',
      width: '50vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
          '2000px': '50vw',
          '1199px': '75vw',
          '640px': '90vw'
      },
      modal: true,
      closable: false,
      data: {
        playgroundModel: this
      },
      // templates: {
      //     footer: Footer
      // }
    });

    this._subscription = this._dialogRef.onClose.subscribe((data: any) => {
      console.log('Playground Game Rules Dialog Closed. Data: ', data);
    })

    console.log('DialogRef: ', this._dialogRef);
    console.log('DialogRef getInstance: ', this._dialogService.getInstance(this._dialogRef));
  }


  private placeBets() {
    // This method should return the graphic(Place Bets Modal or Image/Gif) to be shown on screen and not the bet amounts of players.

    // this.gameStages.set(PlaygroundGameStage.BET, true);



    return of();
    // return combineLatest([this.playerOneBet(), this.playerTwoBet()]);
  }

  private toss() {
    // this.gameStages.set(PlaygroundGameStage.TOSS, true);

    return this.gameStage$.pipe(
      filter((stage) => stage === PlaygroundGameStage.TOSS),
      switchMap(() => forkJoin({ test: this.doGameToss() })
      // .pipe(
      //   // tap((data) => this.gameStages.set(PlaygroundGameStage.TOSS, false))
      //   tap((data) => this._gameStage.next(PlaygroundGameStage.BET))
      // )
    ),
    );
  }

  public commenceRound() {
    return concat(
      this.toss(),
      this.placeBets());
  }

  public showPlaygroundGameRulesDialog(): void {
    this._dialogRef = this._dialogService.open(PlaygroundGameRulesComponent, {
      header: 'Welcome to the Playground!',
      width: '50vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
          '2000px': '50vw',
          '1199px': '75vw',
          '640px': '90vw'
      },
      modal: true,
      closable: false
      // templates: {
      //     footer: Footer
      // }
    });

    this._subscription = this._dialogRef.onClose.subscribe((data: any) => {
      this.showPlaygroundGameInitiationDialog();
      console.log('Playground Game Rules Dialog Closed. Data: ', data);
    });

    console.log('DialogRef: ', this._dialogRef);
    console.log('DialogRef getInstance: ', this._dialogService.getInstance(this._dialogRef));
  }

  public doGameToss() {
    // Toss between Player and Opponent automatically, just show their names as 'Player 1', 'Player 2' as buttons and highlight borders alternatively for like 5 secs and using randomizer just pick between the two Players.
    // Randomizer logic to get Players's order.

    const getRandomOrder = () => (Math.floor(Math.random() * 2) + 1);

    // NOTE - Player 1 Wins the Toss, starts first! - PlaygroundTossOutcome.PLAYER_1
    // NOTE - Player 2 Wins the Toss, starts first! - PlaygroundTossOutcome.PLAYER_2
    const setPlayerOrder = (tossOutcome: number) => {
      if (this._playgroundService.createPlayground) {
        if(tossOutcome === PlaygroundTossOutcome.PLAYER_1) {
          // TODO: Alongside the below line, call the 'peerConnection's send method'
          this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: '1', messageFrom: 'peer' } as GameMidSegwayMetadata));
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.TOSS, message: true, messageFrom: 'subject' } as GameMidSegwayMetadata);
          // this._gameTossWinnerDetails = 'Player 1 Wins the Toss! Begins first!!'
        } else {
          // TODO: Alongside the below line, call the 'peerConnection's send method'
          this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: '0', messageFrom: 'peer' } as GameMidSegwayMetadata));
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.TOSS, message: false, messageFrom: 'subject' } as GameMidSegwayMetadata);
          // this._gameTossWinnerDetails = 'Player 2 Wins the Toss! Begins first!!'
        }
      }
      // this._gameTossWinnerDetails = 'Player 1 Wins the Toss! Begins first!!'
    }

    // {
    //   if(tossResult === 1) {
    //     this._switch = true; // NOTE - Player 1 Wins the Toss, starts first!

    //   } else {
    //     this._switch = false; // NOTE - Player 2 Wins the Toss, starts first!

    //   }
    // }

    let toggleSwitch = false;
    this._gameTossWinnerDetails = 'Waiting for your partner to start the toss';

    const interval$ = interval(500).pipe(
    (this._playgroundService.createPlayground ? take(10) : takeUntil((this._playgroundService.tossCompleted))),
    // take(10),
    tap(() => {
      toggleSwitch = !toggleSwitch;
      // this._playgroundService.switch = !this._playgroundService.switch
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.TOSS, message: toggleSwitch, messageFrom: 'subject' } as GameMidSegwayMetadata);
    }));

    const gameOrder$ = of(toggleSwitch).pipe(
      // takeLast(1),
      tap(() => setPlayerOrder(getRandomOrder())));

    const gameTossResult$ = this.switch$.pipe(
      // takeLast(1),
      tap((metaData?: GameMidSegwayMetadata) => {
        // this._dialogRef?.close())
        if (metaData !== undefined) {
          this._playgroundService.ngZone.run(() => {
            this._gameTossWinnerDetails = metaData.message ? 'Player 1 Wins the Toss! Begins first!!' : 'Player 2 Wins the Toss! Begins first!!';
            // if (metaData.messageFrom === 'peer') {
            //   this._playgroundService.tossCompleted.next(PlaygroundGameTossStage.PHASE_1);
            // }
            if (metaData?.messageFrom === 'peer') {
              this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStage.TOSS, message: PlaygroundGameTossStage.PHASE_1, messageFrom: 'subject' });
            }
            console.log('gameTossWinnerDetails: ', this._gameTossWinnerDetails);
          });
        }
      }),
    delay(5000),
    tap((metaData: GameMidSegwayMetadata | undefined) => {
      console.log('delay: ', metaData);
      // this._playgroundService.tossCompleted.next(true);
      // this._playgroundService.tossCompleted.complete();
    }));

    const tossCompleted$ = this.tossCompleted$.pipe(
      tap((tossPhase: GameMidSegwayMetadata | undefined) => {
        if (tossPhase?.message === PlaygroundGameTossStage.PHASE_1) {
          // delay(2500);
          // this._playgroundService.switch.complete();
        }
        // this._playgroundService.ngZone.run(() => {
        //   // this._tossCompleted = tossPhase?.message;
        // })
        console.log('This is Me: ', tossPhase);
      })
    );

    return merge(
      concat(
      interval$,
      this._playgroundService.createPlayground ? gameOrder$ : of(),
      gameTossResult$
    ),
    tossCompleted$)
  }

  public initializeBetting(): void {
    this._gameStage.next(PlaygroundGameStage.BET);
  }

  public unsubscribeAll(): void {
    this._subscription.unsubscribe();
  }

//   public toss() {
//     // Toss between Player and Opponent automatically, just show their names as 'Player 1', 'Player 2' as buttons and highlight borders alternatively for like 5 secs and using randomizer just pick between the two Players.
//     // Randomizer logic to get Players's order.

//     // this._playerOrder.set('Player1', 1);
//     // this._playerOrder.set('Player2', 2);


//     const source = interval(1000);
//     const clicks = fromEvent(document, 'click');
//     const result = source.pipe(takeUntil(clicks));
//     // result.subscribe(x => console.log(x));

//     const timer = interval(500);

//     const getRandomOrder = () => (Math.floor(Math.random() * 2) + 1);
//     const setPlayerOrder = (tossResult: number) => {
//       if(tossResult === 1) {
//         this._switch = true; // NOTE - Player 1 Wins the Toss, starts first!
//         this._playerOrder.set('Player1', 1);
//         this._playerOrder.set('Player2', 2);
//       } else {
//         this._switch = false; // NOTE - Player 2 Wins the Toss, starts first!
//         this._playerOrder.set('Player1', 2);
//         this._playerOrder.set('Player2', 1);
//       }
//     }

//     this.gameToss = true;
//     // return of(this.gameToss).pipe(
//     // // delay(15000),
//     // tap(() => this.gameToss = false),
//     // map(() => this._playerOrder));

//     const timer$ = timer.pipe(
// take(10),
// tap(() => this._switch = !this._switch));
// // tap(() => this._playgroundService.sendWebRtcMessages('Ohayo! Sekai!! Good Morning World!!!')));

//   const gameOrder$ = of(this.gameToss).pipe(
//     tap(() => setPlayerOrder(getRandomOrder())),
//     delay(5000),
//     tap(() => this.gameToss = false));
//     // tap(() => console.log('Hi!')),
//     // delay(5000),
//     // tap(() => console.log('Bye!')),
//     // map(() => (this.gameToss = false, getRandomOrder())),
//     // map(yo => yo));

//     return concat(
//       timer$,
//       gameOrder$
//     )



//     // const abc = interval(1000);

//     // this.gameToss = true;
//     // return abc.pipe(
//     //   take(5),
//     //                 tap(() => this.counter++),
//     // delay(5000),
//     // tap(() => this.gameToss = false),
//     // map(() => this._playerOrder));

//     // return of(this._playerOrder);
//   }


  // public playerOneBet() {
  //   return of(this.playerOneBetAmount);
  // }

  // public playerTwoBet() {
  //   return of(this.playerTwoBetAmount);
  // }

}

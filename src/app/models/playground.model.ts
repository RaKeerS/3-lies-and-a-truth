import { Injector } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  BehaviorSubject,
  concat,
  delay,
  filter,
  forkJoin,
  interval,
  last,
  merge,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  takeUntil,
  takeWhile,
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

  private _playerOneBetAmount: number = 10;
  private _playerTwoBetAmount: number = 10;
  private _playgroundTimer: number = 0o0;

  private _gameStages: Map<PlaygroundGameStage, boolean> = new Map<PlaygroundGameStage, boolean>();

  // NOTE - This Subject is only used to 'Update the GameStages'
  private _gameStage: BehaviorSubject<PlaygroundGameStage> = new BehaviorSubject<PlaygroundGameStage>(PlaygroundGameStage.RULES);

  private _subscription: Subscription;

  private _isShuffleDeckInitiated: boolean = false;
  private _shuffleDeckHeader: string = 'Shuffling Deck, Please Wait...';
  private _cardDeckPickerHeader: string = '';


  constructor(injector: Injector) {
    this._playgroundService = injector.get(PlaygroundService);
    // this._playgroundService = playgroundService;
    this._dialogService = injector.get( DialogService);

    this._subscription = this.commenceRound().subscribe();
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

  get playgroundTimer(): string {
    return String(this._playgroundTimer).padStart(4, '0');
  }
  set playgroundTimer(value: number) {
    this._playgroundTimer = value;
  }

  get playgroundBetAmount(): number {
    return this._playgroundService.createPlayground ? this._playerOneBetAmount : this._playerTwoBetAmount
  }
  set playgroundBetAmount(value: number) {
    this._playgroundService.createPlayground ? this._playerOneBetAmount = value : this._playerTwoBetAmount = value;
  }

  get isShuffleDeckInitiated(): boolean {
    return this._isShuffleDeckInitiated;
  }
  set isShuffleDeckInitiated(value: boolean) {
    this._isShuffleDeckInitiated = value;
  }

  get shuffleDeckHeader(): string {
    return this._shuffleDeckHeader;
  }
  set shuffleDeckHeader(value: string) {
    this._shuffleDeckHeader = value;
  }

  get cardDeckPickerHeader(): string {
    return this._cardDeckPickerHeader;
  }
  set cardDeckPickerHeader(value: string) {
    this._cardDeckPickerHeader = value;
  }

  // NOTE: This observable is present in the Service since, it is used to contain/send Game's mid segment metadata, which is similar to the async updates of values/data
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
      console.log('Playground Game Initiation Dialog Closed. Data: ', data);
    });

    console.log('DialogRef: ', this._dialogRef);
    console.log('DialogRef getInstance: ', this._dialogService.getInstance(this._dialogRef));
  }


  private placeBets(): Observable<number | boolean> {
    // This method should return the graphic(Place Bets Modal or Image/Gif) to be shown on screen and not the bet amounts of players.

    // this.gameStages.set(PlaygroundGameStage.BET, true);

    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStage) => stage === PlaygroundGameStage.BET),
      switchMap(() => this.doGameBetting())
    );

    // return combineLatest([this.playerOneBet(), this.playerTwoBet()]);
  }

  private rules() {
    // this.gameStages.set(PlaygroundGameStage.TOSS, true);

    return this.switch$.pipe(
    // takeLast(1),
    filter((metaData?: GameMidSegwayMetadata) => (metaData?.gameStage === PlaygroundGameStage.RULES)),
    tap((metadata?: GameMidSegwayMetadata) => {
      if (metadata?.gameStage === PlaygroundGameStage.RULES) {
        this._gameTossWinnerDetails = 'Starting Toss!';
      }
    }));
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

  private deckShuffling() {
    return this.gameStage$.pipe(
      filter((stage) => stage === PlaygroundGameStage.SHUFFLE),
      filter(() => this.isShuffleDeckInitiated === true),
      switchMap(() => this.doDeckShuffling())
    );
  }

  public commenceRound() {
    return merge(
      this.rules(),
      this.toss(),
      this.placeBets(),
      this.deckShuffling());
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
      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.RULES, message: '', messageFrom: 'peer' } as GameMidSegwayMetadata))
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
    this._gameTossWinnerDetails = this._playgroundService.createPlayground ? 'Starting Toss!' : 'Waiting for your partner to start the toss';

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
      filter((metaData?: GameMidSegwayMetadata) => (metaData?.gameStage === PlaygroundGameStage.RULES || metaData?.gameStage ===  PlaygroundGameStage.TOSS)),
      tap((metaData?: GameMidSegwayMetadata) => {
        // this._dialogRef?.close())
        if (metaData !== undefined) {
          this._playgroundService.ngZone.run(() => {
            this._gameTossWinnerDetails = metaData.message ? 'Player 1 Wins the Toss! Begins first!!' : 'Player 2 Wins the Toss! Begins first!!';
            if (this._playgroundService.createPlayground) {
              this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStage.TOSS, message: PlaygroundGameTossStage.PHASE_1, messageFrom: 'subject' });
            } else {
              this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: metaData.message, messageFrom: 'peer' } as GameMidSegwayMetadata))
            }
            // NOTE - Commented for now, but this code works!
            // if (metaData?.messageFrom === 'peer') {
            //   this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStage.TOSS, message: PlaygroundGameTossStage.PHASE_1, messageFrom: 'subject' });
            // }
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

    // NOTE - Commented for now, but this code works!
    // const tossCompleted$ = this.tossCompleted$.pipe(
    //   tap((tossPhase: GameMidSegwayMetadata | undefined) => {
    //     if (tossPhase?.message === PlaygroundGameTossStage.PHASE_1) {
    //       // delay(2500);
    //       // this._playgroundService.switch.complete();
    //     }
    //     // this._playgroundService.ngZone.run(() => {
    //     //   // this._tossCompleted = tossPhase?.message;
    //     // })
    //     console.log('This is Me: ', tossPhase);
    //   })
    // );

    // NOTE - Commented for now, but this code works!
    // return merge(
    //   concat(
    //   interval$,
    //   this._playgroundService.createPlayground ? gameOrder$ : of(),
    //   gameTossResult$
    // ),
    // tossCompleted$)

    return concat(
      interval$,
      this._playgroundService.createPlayground ? gameOrder$ : of(),
      gameTossResult$
    );
  }

  public doGameBetting() {
    this.playgroundTimer = 200;
    console.log()
    this.playgroundBetAmount = 10;

    const interval$ = interval(1000).pipe(
      takeWhile(() => +this.playgroundTimer !== 0),
      tap(() => {
        this.playgroundTimer = +this.playgroundTimer - 1;
        if (+this.playgroundTimer % 100 === 99) {
          this.playgroundTimer = +this.playgroundTimer - 40;
        }
      })
    );

    // const bettingConclusion$ = interval$.pipe(
    //   tap((data) => console.log('Inside Interval: ', data))
    // );

    const bettingCompleted$ = of(+this.playgroundTimer === 0).pipe(
      takeWhile(() => !this.isShuffleDeckInitiated),
      tap(() => {
        this.playgroundBetAmount = !!this.playgroundBetAmount || this.playgroundBetAmount < 10 ? 10 : this.playgroundBetAmount;
        this.beginDeckShuffling();
        console.log('Timeout!');
      })
    )

    return concat(
      interval$,
      // bettingConclusion$,
      bettingCompleted$
    )
  }

  public doDeckShuffling() {
    this._gameStage.next(PlaygroundGameStage.PICK);
    this.cardDeckPickerHeader = 'Distributing Cards...';

    return interval(1000).pipe(
      take(4000),
      last(),
      tap(() => this.cardDeckPickerHeader = 'Pick the suitable options!')
    );
    // return of();
  }

  public initializeBetting(): void {
    this._gameStage.next(PlaygroundGameStage.BET);
  }

  public beginDeckShuffling(): void {
    this._gameStage.next(PlaygroundGameStage.SHUFFLE);
    this._dialogService.getInstance(this._dialogRef!).hide();
    this.isShuffleDeckInitiated = true;
    interval(1000).pipe(
      take(7),
      delay(1000),
      last(),
      tap(() => this.shuffleDeckHeader = 'Deck Shuffled'),
      delay(500),
      tap(() => this._gameStage.next(PlaygroundGameStage.SHUFFLE))).subscribe();
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

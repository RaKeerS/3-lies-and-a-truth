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

import { CardDeckDictionary } from '../constants/card-deck.dictionary';
import { CardDeckEnum } from '../enums/card-deck.enum';
import { PlaygroundGameStage, PlaygroundGameStagePhase, PlaygroundGameTossOutcome } from '../enums/playground.enum';
import { PlaygroundService } from '../services/playground.service';
import { GameMidSegwayMetadata } from '../types/app-types';
import { PlaygroundGameInitiationComponent } from '../views/playground-game-initiation/playground-game-initiation.component';
import { PlaygroundGameRulesComponent } from '../views/playground-game-rules/playground-game-rules.component';

export class PlaygroundModel {

  private _dialogService: DialogService
  private _dialogRef: DynamicDialogRef | undefined;

  // private _gameToss: boolean = true;
  private _gameTossWinnerDetails: string = '';
  private _playerTossWinner?: PlaygroundGameTossOutcome;
  private _isDeckShufflerPlayer?: boolean;
  private _playerOrder: Map<string, number> = new Map<string, number>();

  private _playgroundService: PlaygroundService;

  private _playerOneBetAmount: number = 10;
  private _playerTwoBetAmount: number = 10;
  private _playgroundTimer: number = 0o0;

  private _gameStages: Map<PlaygroundGameStage, boolean> = new Map<PlaygroundGameStage, boolean>();

  // NOTE - This Subject is only used to 'Update the GameStages'
  private _gameStage: BehaviorSubject<PlaygroundGameStage> = new BehaviorSubject<PlaygroundGameStage>(PlaygroundGameStage.RULES);

  private _subscription: Subscription;

  private _showBackdrop: boolean = false;
  private _isBettingCompleted: boolean = false;
  private _isShuffleDeckInitiated: boolean = false;
  private _isShufflePending: boolean = false;
  private _isOptionsPickerInitiated: boolean = false;
  private _shuffleDeckHeader: string = 'Shuffling Deck, Please Wait...';
  private _cardDeckPickerHeader: string = '';
  private _increaseZIndexCards: boolean = false;
  private _increaseZIndexPicker: boolean = false;
  private _midSegwayMessages: string = '';

  private _deckCardsList: Map<CardDeckEnum, string> = CardDeckDictionary;
  private _voidDeckCardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _p1CardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _p2CardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _playerFalsyPickList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _playerFalsySelectedList: any[] = [];
  private _playerTruthyPickList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _playerTruthySelectedList: any[] = [];
  private _flipCards: boolean = false;
  private _toggleBetweenLiesOrTruth: boolean = false;

  public PlaygroundTossOutcome = PlaygroundGameTossOutcome;


  constructor(injector: Injector) {
    this._playgroundService = injector.get(PlaygroundService);
    // this._playgroundService = playgroundService;
    this._dialogService = injector.get( DialogService);

    this._subscription = this.commenceRound().subscribe();

    this._gameTossWinnerDetails = this._playgroundService.createPlayground ? 'Starting Toss!' : 'Waiting for your partner to start the toss';
  }

  get dialogRef(): DynamicDialogRef | undefined {
    return this._dialogRef;
  }

  get playerCardsList(): Map<CardDeckEnum, string> {
    // NOTE: Player1 is always the one who creates the Playground. Player 2 is always the one who joins the playground. Deck Shuffler Player (i.e. the one who Shuffles and Distributes the Deck) is the one who wins the toss.
    return this._playgroundService.createPlayground ? this.p1CardsList : this.p2CardsList;
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

  // get gameToss(): boolean {
  //   return this._gameToss;
  // }
  // set gameToss(value: boolean) {
  //   this._gameToss = value;
  // }

  get gameTossWinnerDetails(): string {
    return this._gameTossWinnerDetails;
  }


  get playerOrder(): Map<string, number> {
    return this._playerOrder;
  }

  get playerTossWinner(): PlaygroundGameTossOutcome | undefined {
    return this._playerTossWinner;
  }
  set playerTossWinner(value: PlaygroundGameTossOutcome) {
    this._playerTossWinner = value;
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

  get isBettingCompleted(): boolean {
    return this._isBettingCompleted;
  }
  set isBettingCompleted(value: boolean) {
    this._isBettingCompleted = value;
  }

  get isDeckShufflerPlayer(): boolean {
    return !!this._isDeckShufflerPlayer;
  }
  set isDeckShufflerPlayer(value: boolean) {
    this._isDeckShufflerPlayer = value;
  }

  get isShuffleDeckInitiated(): boolean {
    return this._isShuffleDeckInitiated;
  }
  set isShuffleDeckInitiated(value: boolean) {
    this._isShuffleDeckInitiated = value;
  }

  get isShufflePending(): boolean {
    return this._isShufflePending;
  }
  set isShufflePending(value: boolean) {
    this._isShufflePending = value;
  }

  get showBackdrop(): boolean {
    return this._showBackdrop;
  }
  set showBackdrop(value: boolean) {
    this._showBackdrop = value;
  }

  get isOptionsPickerInitiated(): boolean {
    return this._isOptionsPickerInitiated;
  }
  set isOptionsPickerInitiated(value: boolean) {
    this._isOptionsPickerInitiated = value;
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

  get increaseZIndexCards(): boolean {
    return this._increaseZIndexCards;
  }
  set increaseZIndexCards(value: boolean) {
    this._increaseZIndexCards = value;
  }

  get increaseZIndexPicker(): boolean {
    return this._increaseZIndexPicker;
  }
  set increaseZIndexPicker(value: boolean) {
    this._increaseZIndexPicker = value;
  }

  get midSegwayMessages(): string {
    return this._midSegwayMessages;
  }
  set midSegwayMessages(value: string) {
    this._midSegwayMessages = value;
  }

  get playerName(): string {
    return this._playgroundService.playerName;
  }

  get p1CardsList(): Map<CardDeckEnum, string> {
    return this._p1CardsList;
  }
  set p1CardsList(value: Map<CardDeckEnum, string>) {
    this._p1CardsList = value;
  }

  get p2CardsList(): Map<CardDeckEnum, string> {
    return this._p2CardsList;
  }
  set p2CardsList(value: Map<CardDeckEnum, string>) {
    this._p2CardsList = value;
  }

  get playerFalsyPickList(): Map<CardDeckEnum, string> {
    return this._playerFalsyPickList;
  }
  set playerFalsyPickList(value: Map<CardDeckEnum, string>) {
    this._playerFalsyPickList = value;
  }

  get playerFalsySelectedList(): any[] {
    return this._playerFalsySelectedList;
  }
  set playerFalsySelectedList(value: any[]) {
    this._playerFalsySelectedList = value;
  }

  get playerTruthyPickList(): Map<CardDeckEnum, string> {
    return this._playerTruthyPickList;
  }
  set playerTruthyPickList(value: Map<CardDeckEnum, string>) {
    this._playerTruthyPickList = value;
  }

  get playerTruthySelectedList(): any[] {
    return this._playerTruthySelectedList;
  }
  set playerTruthySelectedList(value: any[]) {
    this._playerTruthySelectedList = value;
  }

  get flipCards(): boolean {
    return this._flipCards;
  }
  set flipCards(value: boolean) {
    this._flipCards = value;
  }

  get toggleBetweenLiesOrTruth(): boolean {
    return this._toggleBetweenLiesOrTruth;
  }
  set toggleBetweenLiesOrTruth(value: boolean) {
    this._toggleBetweenLiesOrTruth = value;
  }

  get deckCardsList(): Map<CardDeckEnum, string> {
    return this._deckCardsList;
  }
  // set deckCardsList(value: Map<CardDeckEnum, string>) {
  //   this._deckCardsList = value;
  // }

  get voidDeckCardsList(): Map<CardDeckEnum, string> {
    return this._voidDeckCardsList;
  }
  set voidDeckCardsList(value: Map<CardDeckEnum, string>) {
    this._voidDeckCardsList = value;
  }

  // NOTE: This observable is present in the Service since, it is used to contain/send Game's mid segment metadata, which is similar to the async updates of values/data
  get switch$(): Observable<GameMidSegwayMetadata | undefined> {
    return this._playgroundService.switch$;
  }

  get tossCompleted$(): Observable<GameMidSegwayMetadata> {
    return this._playgroundService.tossCompleted$;
  }


  private showPlaygroundGameInitiationDialog(): void { // TODO: Redefine this method for perform Toss for the match, add new component
    // this.gameStages.set(PlaygroundGameStage.TOSS, true);
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

    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStage) => stage === PlaygroundGameStage.RULES),
      switchMap(() => this.doGameRulesRevelation())
    )
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
      // filter(() => this.isShuffleDeckInitiated === true),
      switchMap(() => this.doDeckShuffling())
    );
  }

  public distributeCards() {
    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStage) => stage === PlaygroundGameStage.DISTRIBUTE),
      switchMap((stage: PlaygroundGameStage) => this.doDeckDistribution(stage))
    )
  }

  public pickOptions() {
    return of();
    // return this.gameStage$.pipe(
    //   filter((stage: PlaygroundGameStage) => stage === PlaygroundGameStage.DISTRIBUTE),
    //   switchMap((stage: PlaygroundGameStage) => this.doDeckDistribution(stage))
    // )
  }

  public commenceRound() {
    return merge(
      this.rules(),
      this.toss(),
      this.placeBets(),
      this.deckShuffling(),
      this.distributeCards(),
      this.pickOptions());
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

  private doGameRulesRevelation() {
    return this.switch$.pipe(
      // takeLast(1),
      filter((metaData?: GameMidSegwayMetadata) => (metaData?.gameStage === PlaygroundGameStage.RULES)),
      tap((metadata?: GameMidSegwayMetadata) => {
        if (metadata?.gameStage === PlaygroundGameStage.RULES) {
          this._gameTossWinnerDetails = 'Starting Toss!';
        }
      }));
  }

  private doGameToss() {
    // Toss between Player and Opponent automatically, just show their names as 'Player 1', 'Player 2' as buttons and highlight borders alternatively for like 5 secs and using randomizer just pick between the two Players.
    // Randomizer logic to get Players's order.

    const getRandomOrder = () => (Math.floor(Math.random() * 2) + 1);

    // NOTE - Player 1 Wins the Toss, starts first! - PlaygroundTossOutcome.PLAYER_1
    // NOTE - Player 2 Wins the Toss, starts first! - PlaygroundTossOutcome.PLAYER_2
    const setPlayerOrder = (tossOutcome: number) => {
      this.playerTossWinner = tossOutcome;
      if (this._playgroundService.createPlayground) {
        if(tossOutcome === PlaygroundGameTossOutcome.PLAYER_1) {
          // TODO: Alongside the below line, call the 'peerConnection's send method'
          this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcome, messageFrom: 'peer' } as GameMidSegwayMetadata));
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcome, tossMessage: this.playerTossWinner as PlaygroundGameTossOutcome, messageFrom: 'subject' } as GameMidSegwayMetadata);
          // this._gameTossWinnerDetails = 'Player 1 Wins the Toss! Begins first!!'
        } else {
          // TODO: Alongside the below line, call the 'peerConnection's send method'
          this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcome, messageFrom: 'peer' } as GameMidSegwayMetadata));
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcome, tossMessage: this.playerTossWinner as PlaygroundGameTossOutcome, messageFrom: 'subject' } as GameMidSegwayMetadata);
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

    const interval$ = interval(500).pipe(
    (this._playgroundService.createPlayground ? take(10) : takeUntil((this._playgroundService.tossCompleted))),
    // take(10),
    tap(() => {
      toggleSwitch = !toggleSwitch;
      // this._playgroundService.switch = !this._playgroundService.switch
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.TOSS, message: toggleSwitch ? PlaygroundGameTossOutcome.PLAYER_1 : PlaygroundGameTossOutcome.PLAYER_2, tossMessage: toggleSwitch ? PlaygroundGameTossOutcome.PLAYER_1 : PlaygroundGameTossOutcome.PLAYER_2, messageFrom: 'subject' } as GameMidSegwayMetadata);
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
            if (metaData.gameStage === PlaygroundGameStage.TOSS) {
              this.playerTossWinner = metaData.message; // NOTE: Contains either 'PlaygroundTossOutcome.PLAYER_1' or 'PlaygroundTossOutcome.PLAYER_2' in 'message'.
              this._gameTossWinnerDetails = this.playerTossWinner === PlaygroundGameTossOutcome.PLAYER_1 ? 'Player 1 Wins the Toss! Begins first!!' : 'Player 2 Wins the Toss! Begins first!!';
            }

            if (this._playgroundService.createPlayground) {
              this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStage.TOSS, message: PlaygroundGameStagePhase.COMPLETED, messageFrom: 'subject' });
            }
            // else {
            //   this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: metaData.message, messageFrom: 'peer' } as GameMidSegwayMetadata))
            // }
            // NOTE - Commented for now, but this code works!
            // if (metaData?.messageFrom === 'peer') {
            //   this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameS.TOStageS, message: PlaygroundGameTossStage.PHASE_1, messageFrom: 'subject' });
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

  private doGameBetting() {
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
      takeWhile(() => !this.isBettingCompleted),
      tap(() => {
        this.playgroundBetAmount = !!this.playgroundBetAmount || this.playgroundBetAmount < 10 ? 10 : this.playgroundBetAmount;
        this.beginDeckShuffling();
        console.log('Timeout!');
      })
    )

    return this.switch$.pipe(
      filter((metaData?: GameMidSegwayMetadata) => metaData?.gameStage === PlaygroundGameStage.BET),
      switchMap(() =>
        concat(
          interval$,
            // bettingConclusion$,
          bettingCompleted$
        ))
    );
  }

  private doDeckShuffling() {

    const tossWinningPlayer = (): boolean => {
      if (this._playgroundService.createPlayground) {
        if (this.playerTossWinner === PlaygroundGameTossOutcome.PLAYER_1) {
          return true;
        }
      } else {
        if (this.playerTossWinner === PlaygroundGameTossOutcome.PLAYER_2) {
          return true;
        }
      }
      this.shuffleDeckHeader = 'Waiting for your partner to begin...';
      return false;

      // if (this.playerTossWinner === PlaygroundTossOutcome.PLAYER_1 && this._playgroundService.createPlayground) {
      //   return of();
      // } else if (this.playerTossWinner === PlaygroundTossOutcome.PLAYER_2 && !this._playgroundService.createPlayground) {
      //   return of();
      // } else {
      //   return waitBeforeShuffling$;
      // }
    }

    let metaDataMessage, beginShuffle;
    const waitBeforeShuffling$ = this.switch$.pipe(
      filter((metaData?: GameMidSegwayMetadata) => metaData?.gameStage === PlaygroundGameStage.SHUFFLE),
      takeWhile((metaData?: GameMidSegwayMetadata) => {
        if (metaData?.beginShuffle) {
          this.isShuffleDeckInitiated = true;
          this.isShufflePending = false;
          this.shuffleDeckHeader = 'Commencing Deck Shuffling...';
          delay(1000);
          this.shuffleDeckHeader = 'Shuffling Deck, Please Wait...';
        }
        return !metaData?.beginShuffle;
      }),
      tap(() => (this.isShuffleDeckInitiated = false, this.isShufflePending = true, this.shuffleDeckHeader = 'Waiting for your partner to join...'))
      // tap((metaData?: GameMidSegwayMetadata) => (metaDataMessage = metaData?.message, beginShuffle = metaData?.beginShuffle)),
      // filter((metaData?: GameMidSegwayMetadata) =>  metaData?.message === PlaygroundGameStage.SHUFFLE && tossWinningPlayer()) ? tap((data) => { console.log('data: ', data) }) : takeUntil(of(beginShuffle === true)),
      // metaDataMessage === PlaygroundGameStage.SHUFFLE && tossWinningPlayer() ? tap(() => {}) : takeUntil(of(beginShuffle === true)),
      // tap((metaData?: GameMidSegwayMetadata) => {
      //   if (metaData?.message === PlaygroundGameStage.SHUFFLE && tossWinningPlayer()) {
      //     this.isShuffleDeckInitiated = true;
      //   }
      // })
      // tap(() => (this.isShuffleDeckInitiated = true, this._gameStage.next(PlaygroundGameStage.SHUFFLE)))
    );

    // const shuffleDeck$ = of(this.isShuffleDeckInitiated = true).pipe(
    //   delay(8000)
    const shuffleDeck$ = interval(1000).pipe(
      take(7),
      delay(1000),
      last(),
      tap(() => this.shuffleDeckHeader = 'Deck Shuffled'),
      delay(1000),
      tap(() => this.shuffleDeckHeader = 'Distributing Cards...'),
      delay(1000),
      tap(() => this.isDeckShufflerPlayer ? this.distributeDeckCards() : of()),
      delay(1000),
      tap(() => this.shuffleDeckHeader = 'Cards Distributed'),
      delay(500),
      tap(() => {
        this._gameStage.next(PlaygroundGameStage.DISTRIBUTE);

        if (this.isDeckShufflerPlayer) {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.DISTRIBUTE, message: PlaygroundGameStage.DISTRIBUTE, gameStagePhase: PlaygroundGameStagePhase.INITIAL, messageFrom: 'subject' } as GameMidSegwayMetadata);
        }
      }));

    // const waitForPlayerBeforeShuffling$ = this.playerTossWinner === PlaygroundTossOutcome.PLAYER_1 ? of() : waitBeforeShuffling$

    return concat(
      waitBeforeShuffling$,
      shuffleDeck$
    )

    // this._gameStage.next(PlaygroundGameStage.PICK);
    // this.cardDeckPickerHeader = 'Distributing Cards...';

    // return interval(1000).pipe(
    //   take(4000),
    //   last(),
    //   tap(() => this.cardDeckPickerHeader = 'Pick the suitable options!')
    // );
  }

  private doDeckDistribution(_stage: PlaygroundGameStage) {

    // const assignDistributedCards = (metaData?: GameMidSegwayMetadata) => {
    // }

    return this.switch$.pipe(
      filter((metaData?: GameMidSegwayMetadata) => (metaData?.gameStage === PlaygroundGameStage.DISTRIBUTE)),
      switchMap((metaData?: GameMidSegwayMetadata) => {
        if (metaData?.gameStagePhase === PlaygroundGameStagePhase.INITIAL) {
          return of(metaData).pipe(
            tap((metaData) => {
              if (metaData.message && !this.isDeckShufflerPlayer) {
                this.p1CardsList = new Map(metaData.message.p1CardsList);
                this.p2CardsList = new Map(metaData.message.p2CardsList);
              }
            }),
            // NOTE - Create Options PickList for the Player.
            tap(() => this.createPicklistForPlayer()),
            tap(() => (this.isShuffleDeckInitiated = false, this.isOptionsPickerInitiated = true, this.cardDeckPickerHeader = 'You can have a look at the cards assigned.')),
            delay(4000),
            tap(() => (this.cardDeckPickerHeader = 'Pick suitable options from the ones presented!')),
            delay(1000),
            tap(() => (this.isOptionsPickerInitiated = false, this.midSegwayMessages = 'You can have a look at the cards assigned.', window.scrollTo(0, (document.body.scrollHeight - 1080)))),
            delay(500),
            tap(() => this.increaseZIndexCards = true),
            delay(1000),
            tap(() => (this.midSegwayMessages = 'Pick suitable options from the ones presented!')),
            delay(500),
            tap(() => this.increaseZIndexPicker = true),
            tap(() => (this._gameStage.next(PlaygroundGameStage.PICK), this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.PICK, message: PlaygroundGameStage.PICK, gameStagePhase: PlaygroundGameStagePhase.INITIAL, messageFrom: 'subject' } as GameMidSegwayMetadata))),
          );
        } else if (metaData?.gameStagePhase === PlaygroundGameStagePhase.INTERMEDIATE) {
          return of();
        } else {
          return of();
        }
      })
    );
  }

  // ===========================================================================
  // Event Handlers for Button Clicks
  // ===========================================================================

  public initializeBetting(): void {
    this._gameStage.next(PlaygroundGameStage.BET);
    this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.BET, message: PlaygroundGameStagePhase.INITIAL, messageFrom: 'subject' } as GameMidSegwayMetadata);
  }

  public beginDeckShuffling(): void {
    this.isBettingCompleted = true;
    this.isShuffleDeckInitiated = true;
    this.isShufflePending = false;
    this._dialogService.getInstance(this._dialogRef!).hide();
    this.showBackdrop = true;
    this._gameStage.next(PlaygroundGameStage.SHUFFLE);

    this.isDeckShufflerPlayer = true;
    // this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.SHUFFLE, message: '', messageFrom: 'subject' } as GameMidSegwayMetadata);

    if (this.playerTossWinner === PlaygroundGameTossOutcome.PLAYER_1 && this._playgroundService.createPlayground) {
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.SHUFFLE, message: PlaygroundGameStage.SHUFFLE, beginShuffle: true, messageFrom: 'subject' } as GameMidSegwayMetadata);
      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.SHUFFLE, message: PlaygroundGameStage.SHUFFLE, messageFrom: 'peer' } as GameMidSegwayMetadata));
    } else if (this.playerTossWinner === PlaygroundGameTossOutcome.PLAYER_2 && !this._playgroundService.createPlayground) {
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.SHUFFLE, message: PlaygroundGameStage.SHUFFLE, beginShuffle: true, messageFrom: 'subject' } as GameMidSegwayMetadata);
      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.SHUFFLE, message: PlaygroundGameStage.SHUFFLE, messageFrom: 'peer' } as GameMidSegwayMetadata));
    } else {
      this.isDeckShufflerPlayer = false;
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.SHUFFLE, message: '', beginShuffle: false, messageFrom: 'subject' } as GameMidSegwayMetadata);
    }
  }

  // public beginDeckShuffling(): void {
  //   this._gameStage.next(PlaygroundGameStage.SHUFFLE);
  //   this._dialogService.getInstance(this._dialogRef!).hide();
  //   this.isShuffleDeckInitiated = true;

  //   interval(1000).pipe(
  //     take(7),
  //     delay(1000),
  //     last(),
  //     tap(() => this.shuffleDeckHeader = 'Deck Shuffled'),
  //     delay(1000),
  //     tap(() => this.shuffleDeckHeader = 'Distributing Cards...'),
  //     delay(1000),
  //     tap(() => this.distributeDeckCards()),
  //     delay(1000),
  //     tap(() => this.shuffleDeckHeader = 'Cards Distributed'),
  //     tap(() => this._gameStage.next(PlaygroundGameStage.SHUFFLE))).subscribe();
  // }

  // FIXME // NOTE - This method should only be called if 'this.createPlayground' is true, this is because both sessions are generating different sets of cards for 'Player 1' and 'Player 2'. - [Done Implementing]
  private distributeDeckCards(_player?: PlaygroundGameTossOutcome): void {
    // const distributionOngoing = true;

    // const firstPlayerCardsList = this.playerTossWinner === PlaygroundTossOutcome.PLAYER_1 ? this.p1CardsList : this.p2CardsList;
    // const secondPlayerCardsList = this.playerTossWinner === PlaygroundTossOutcome.PLAYER_1 ? this.p2CardsList : this.p1CardsList;

    const firstPlayerCardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
    const secondPlayerCardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();

    // if (this.playerTossWinner === PlaygroundTossOutcome.PLAYER_1) {
      // NOTE: Distributing Cards to Player 1 first and next to Player 2

    while(true) {
      const randomNumber = Math.floor(Math.random() * 53) + 1;
      if (this.deckCardsList.has(randomNumber)) {
        if (firstPlayerCardsList.size === 0) {
          firstPlayerCardsList.set(randomNumber, CardDeckEnum[randomNumber]);
        } else {
          if (!firstPlayerCardsList.has(randomNumber)) {
            firstPlayerCardsList.set(randomNumber, CardDeckEnum[randomNumber]);
          }
        }
        this.deckCardsList.delete(randomNumber);
      }

      if (firstPlayerCardsList.size === 4) {
        break;
      }
    }

    while(true) {
      const randomNumber = Math.floor(Math.random() * 53) + 1;
      if (this.deckCardsList.has(randomNumber)) {
        if (secondPlayerCardsList.size === 0) {
          secondPlayerCardsList.set(randomNumber, CardDeckEnum[randomNumber]);
        } else {
          if (!secondPlayerCardsList.has(randomNumber) && !firstPlayerCardsList.has(randomNumber)) { // NOTE: Even if we exclude '&& !firstPlayerCardsList.has(randomNumber)' this part, it would still work since, the 'this.deckCardsList' deletes the entry when distributing cards to 'firstPlayer'.
            secondPlayerCardsList.set(randomNumber, CardDeckEnum[randomNumber]);
          }
        }
        this.deckCardsList.delete(randomNumber);
      }


      if (secondPlayerCardsList.size === 4) {
        break;
      }
    }

    this.playerTossWinner === PlaygroundGameTossOutcome.PLAYER_1 ? (this.p1CardsList = firstPlayerCardsList, this.p2CardsList = secondPlayerCardsList) : (this.p1CardsList = secondPlayerCardsList, this.p2CardsList = firstPlayerCardsList);

    this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStage.DISTRIBUTE, message: { p1CardsList: Array.from(this.p1CardsList.entries()), p2CardsList: Array.from(this.p2CardsList.entries()) }, messageFrom: 'peer' } as GameMidSegwayMetadata))
    // } else {

    // }
  }

  private createPicklistForPlayer(): void {
    const playerPicklist: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();

    while(true) {
      const randomNumber = Math.floor(Math.random() * 53) + 1;
      if (this.deckCardsList.has(randomNumber) || this.voidDeckCardsList.has(randomNumber)) {
        if (!this.p1CardsList.has(randomNumber) && !this.p2CardsList.has(randomNumber)) {
          if (playerPicklist.size === 0) {
            playerPicklist.set(randomNumber, CardDeckEnum[randomNumber]);
          } else {
            if (!playerPicklist.has(randomNumber)) {
              playerPicklist.set(randomNumber, CardDeckEnum[randomNumber]);
            }
          }
        }
      }

      if (playerPicklist.size === 4) {
        // const random = Math.floor(Math.random() * 4);
        // const key = Array.from(this.playerCardsList.keys())[random];
        // playerPicklist.set(key, this.playerCardsList.get(key) ?? CardDeckEnum[randomNumber]);
        break;
      }
    }

    this.playerFalsyPickList = playerPicklist;
    this.playerTruthyPickList = this.playerCardsList;
    console.log('PlayerCardsList: ', this.playerCardsList);
    console.log('PlayerFalsyPickList: ', this.playerFalsyPickList);
    console.log('PlayerTruthyPickList: ', this.playerTruthyPickList);
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

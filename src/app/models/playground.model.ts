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
  takeLast,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';

import { CardDeckDictionary } from '../constants/card-deck.dictionary';
import { CardDeckEnum } from '../enums/card-deck.enum';
import {
  PlaygroundGameStageEnum,
  PlaygroundGameStagePhaseEnum,
  PlaygroundGameStageWinnerEnum,
  PlaygroundGameTossOutcomeEnum,
  PlaygroundPlayersEnum,
} from '../enums/playground.enum';
import { PlaygroundService } from '../services/playground.service';
import { GameMidSegueMetadata } from '../types/app-types';
import {
  PlaygroundGameInitiationDialogComponent,
} from '../views/modal-dialogs/playground-game-initiation-dialog/playground-game-initiation-dialog.component';
import {
  PlaygroundGameRulesDialogComponent,
} from '../views/modal-dialogs/playground-game-rules-dialog/playground-game-rules-dialog.component';

export class PlaygroundModel {

  private _dialogService: DialogService
  private _dialogRef: DynamicDialogRef | undefined;

  private _gameTossWinnerDetails: string = '';
  private _playerTossWinner?: PlaygroundGameTossOutcomeEnum;
  private _playerGameStageWinner?: PlaygroundGameStageWinnerEnum;
  private _isDeckShufflerPlayer?: boolean;
  private _playerOrder: Map<string, number> = new Map<string, number>();

  private _playgroundService: PlaygroundService;

  private _playerOneBetAmount: number = 10;
  private _playerTwoBetAmount: number = 10;
  private _playgroundTimer: number = 0o0;
  private _globalPlaygroundTimer: number = 0o0;
  private _globalPlaygroundRoundCounter: number = 1;
  private _playerVoidListInspectionCounter: number = 4;
  private _opponentVoidListInspectionCounter: number = 4;

  private _gameStages: Map<PlaygroundGameStageEnum, boolean> = new Map<PlaygroundGameStageEnum, boolean>();

  // NOTE - This Subject is only used to 'Update the GameStages'
  private _gameStage: BehaviorSubject<PlaygroundGameStageEnum> = new BehaviorSubject<PlaygroundGameStageEnum>(PlaygroundGameStageEnum.RULES);

  private _subscription: Subscription;
  private _globalPlaygroundTimerSubscription?: Subscription;
  private _globalPlaygroundMidSegueMessagesSubscription?: Subscription;

  private _isGameStageToss: boolean = false;
  private _showBackdrop: boolean = false;
  private _isBettingCompleted: boolean = false;
  private _isShuffleDeckInitiated: boolean = false;
  private _isShufflePending: boolean = false;
  private _isOptionsPickerInitiated: boolean = false;
  private _shuffleDeckHeader: string = 'Shuffling Deck, Please Wait...';
  private _cardDeckPickerHeader: string = '';
  private _waitingZoneHeader: string = '';
  private _increaseZIndexCards: boolean = false;
  private _increaseZIndexPicker: boolean = false;
  private _increaseZIndexVoidedCards: boolean = false;
  private _midSegueMessages: string = '';
  private _showMidSegueMessages: boolean = false;
  private _showPlayerSegueMessages: boolean = false;
  private _enableWaitingZone: boolean = false;
  private _showWaitingHeader: boolean = false;
  private _enableSubmitOptionsButton: boolean = true;
  private _showVoidedCardsList: boolean = false;

  private _deckCardsList: Map<CardDeckEnum, string> = CardDeckDictionary;
  private _voidDeckCardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _p1CardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _p2CardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _opponentPickList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _choicesSelectedList?: any[] | CardDeckEnum;
  private _opponentTruthySelectedList?: CardDeckEnum;
  private _opponentFalsySelectedList?: any[];
  private _opponentTruthySelectedListTemp?: CardDeckEnum;
  private _opponentFalsySelectedListTemp?: any[];
  private _playerFalsyPickList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _playerFalsySelectedList: any[] = [];
  private _playerTruthyPickList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
  private _playerTruthySelectedList?: CardDeckEnum;
  private _flipCards: boolean = false;
  private _toggleBetweenLiesOrTruth: boolean = false;

  public PlaygroundTossOutcome = PlaygroundGameTossOutcomeEnum;
  public PlaygroundPlayersEnum = PlaygroundPlayersEnum;


  constructor(injector: Injector) {
    this._playgroundService = injector.get(PlaygroundService);
    this._dialogService = injector.get( DialogService);
    this._subscription = this.commenceRound().subscribe();
    this._gameTossWinnerDetails = this._playgroundService.createPlayground ? 'Starting Toss!' : 'Waiting for your partner to start the toss';

    this._gameStage.next(PlaygroundGameStageEnum.OTHER);
  }

  get dialogRef(): DynamicDialogRef | undefined {
    return this._dialogRef;
  }

  get whoAmI(): PlaygroundPlayersEnum {
    return this._playgroundService.createPlayground ? PlaygroundPlayersEnum.PLAYER_1 : PlaygroundPlayersEnum.PLAYER_2;
  }

  get whoIsOpponent(): PlaygroundPlayersEnum {
    return this.whoAmI === PlaygroundPlayersEnum.PLAYER_1 ? PlaygroundPlayersEnum.PLAYER_2 : PlaygroundPlayersEnum.PLAYER_1;
  }

  get isConnected(): boolean {
    return this._playgroundService.isConnected;
  }

  get isGameStageTossOrTimer(): string {
    return this._isGameStageToss ? 'Game Toss' : 'Timer';
  }

  get playerCardsList(): Map<CardDeckEnum, string> {
    // NOTE: Player1 is always the one who creates the Playground. Player 2 is always the one who joins the playground. Deck Shuffler Player (i.e. the one who Shuffles and Distributes the Deck) is the one who wins the toss.
    return this._playgroundService.createPlayground ? this.p1CardsList : this.p2CardsList;
  }

  get gameStage$(): Observable<PlaygroundGameStageEnum> {
    return this._gameStage.asObservable();
  }

  get gameStages(): Map<PlaygroundGameStageEnum, boolean> {
    return this._gameStages;
  }

  get gameStageToss() {
    return of(this.gameStages.get(PlaygroundGameStageEnum.TOSS));
  }

  get gameStageBet(): boolean | undefined {
    return this.gameStages.get(PlaygroundGameStageEnum.BET);
  }

  get gameTossWinnerDetails(): string {
    return this._gameTossWinnerDetails;
  }

  get playerOrder(): Map<string, number> {
    return this._playerOrder;
  }

  get playerTossWinner(): PlaygroundGameTossOutcomeEnum | undefined {
    return this._playerTossWinner;
  }
  set playerTossWinner(value: PlaygroundGameTossOutcomeEnum) {
    this._playerTossWinner = value;
  }

  get playerGameStageWinner(): PlaygroundGameStageWinnerEnum | undefined {
    return this._playerGameStageWinner;
  }
  set playerGameStageWinner(value: PlaygroundGameStageWinnerEnum) {
    this._playerGameStageWinner = value;
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

  get globalPlaygroundTimer(): string {
    return String(this._globalPlaygroundTimer).padStart(4, '0');
  }
  set globalPlaygroundTimer(value: number) {
    this._globalPlaygroundTimer = value;
  }

  get globalPlaygroundRoundCounter(): number {
    return this._globalPlaygroundRoundCounter;
  }
  set globalPlaygroundRoundCounter(value: number) {
    this._globalPlaygroundRoundCounter = value;
  }

  get playerVoidListInspectionCounter(): number {
    return this._playerVoidListInspectionCounter;
  }
  set playerVoidListInspectionCounter(value: number) {
    this._playerVoidListInspectionCounter = value;
  }

  get opponentVoidListInspectionCounter(): number {
    return this._opponentVoidListInspectionCounter;
  }
  set opponentVoidListInspectionCounter(value: number) {
    this._opponentVoidListInspectionCounter = value;
  }

  get playgroundCreatorBetAmount(): number {
    return this._playgroundService.createPlayground ? this._playerOneBetAmount : this._playerTwoBetAmount
  }
  set playgroundCreatorBetAmount(value: number) {
    this._playgroundService.createPlayground ? this._playerOneBetAmount = value : this._playerTwoBetAmount = value;
  }

  get playgroundJoinerBetAmount(): number {
    return this._playgroundService.createPlayground ? this._playerTwoBetAmount : this._playerOneBetAmount;
  }
  set playgroundJoinerBetAmount(value: number) {
    this._playgroundService.createPlayground ? this._playerTwoBetAmount = value : this._playerOneBetAmount = value;
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

  get showVoidedCardsList(): boolean {
    return this._showVoidedCardsList;
  }
  set showVoidedCardsList(value: boolean) {
    this._showVoidedCardsList = value;
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

  get waitingZoneHeader(): string {
    return this._waitingZoneHeader;
  }
  set waitingZoneHeader(value: string) {
    this._waitingZoneHeader = value;
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

  get increaseZIndexVoidedCards(): boolean {
    return this._increaseZIndexVoidedCards;
  }
  set increaseZIndexVoidedCards(value: boolean) {
    this._increaseZIndexVoidedCards = value;
  }

  get midSegueMessages(): string {
    return this._midSegueMessages;
  }
  set midSegueMessages(value: string) {
    this._midSegueMessages = value;
  }

  get showMidSegueMessages(): boolean {
    return this._showMidSegueMessages;
  }
  set showMidSegueMessages(value: boolean) {
    this._showMidSegueMessages = value;
  }

  get showPlayerSegueMessages(): boolean {
    return this._showPlayerSegueMessages;
  }
  set showPlayerSegueMessages(value: boolean) {
    this._showPlayerSegueMessages = value;
  }

  get playerName(): string {
    return this._playgroundService.playerName;
  }

  get opponentName(): string {
    return this._playgroundService.opponentName;
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

  get opponentPickList(): Map<CardDeckEnum, string> {
    return this._opponentPickList;
  }
  set opponentPickList(value: Map<CardDeckEnum, string>) {
    this._opponentPickList = value;
  }

  get choicesSelectedList(): any[] | CardDeckEnum | undefined {
    return this._choicesSelectedList;
  }
  set choicesSelectedList(value: any[] | CardDeckEnum | undefined) {
    this._choicesSelectedList = value;
  }

  get opponentFalsySelectedListTemp(): any[] {
    return this._opponentFalsySelectedListTemp as any[];
  }
  set opponentFalsySelectedListTemp(value: any[]) {
    this.choicesSelectedList = value;
    this._opponentFalsySelectedListTemp = value;
  }

  get opponentTruthySelectedListTemp(): CardDeckEnum {
    return this._opponentTruthySelectedListTemp as CardDeckEnum;
  }
  set opponentTruthySelectedListTemp(value: CardDeckEnum | undefined) {
    this.choicesSelectedList = value;
    this._opponentTruthySelectedListTemp = value;
  }

  get opponentFalsySelectedList(): any[] {
    return this._opponentFalsySelectedList as any[];
  }
  set opponentFalsySelectedList(value: any[]) {
    this._opponentFalsySelectedList = value;
  }

  get opponentTruthySelectedList(): CardDeckEnum {
    return this._opponentTruthySelectedList as CardDeckEnum;
  }
  set opponentTruthySelectedList(value: CardDeckEnum) {
    this._opponentTruthySelectedList = value;
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

  get playerTruthySelectedList(): CardDeckEnum | undefined {
    return this._playerTruthySelectedList;
  }
  set playerTruthySelectedList(value: CardDeckEnum | undefined) {
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
  set deckCardsList(value: Map<CardDeckEnum, string>) {
    this._deckCardsList = value;
  }

  get voidDeckCardsList(): Map<CardDeckEnum, string> {
    return this._voidDeckCardsList;
  }
  set voidDeckCardsList(value: Map<CardDeckEnum, string>) {
    this._voidDeckCardsList = value;
  }

  get enableWaitingZone(): boolean {
    return this._enableWaitingZone;
  }
  set enableWaitingZone(value: boolean) {
    this._enableWaitingZone = value;
  }

  get showWaitingHeader(): boolean {
    return this._showWaitingHeader;
  }
  set showWaitingHeader(value: boolean) {
    this._showWaitingHeader = value;
  }

  get enableSubmitOptionsButton(): boolean {
    return this._enableSubmitOptionsButton;
  }
  set enableSubmitOptionsButton(value: boolean) {
    this._enableSubmitOptionsButton = value;
  }

  // NOTE: This observable is present in the Service since, it is used to contain/send Game's mid segment metadata, which is similar to the async updates of values/data
  get switch$(): Observable<GameMidSegueMetadata | undefined> {
    return this._playgroundService.switch$;
  }

  get tossCompleted$(): Observable<GameMidSegueMetadata> {
    return this._playgroundService.tossCompleted$;
  }


  private showPlaygroundGameInitiationDialog(): void { // TODO: Redefine this method for perform Toss for the match, add new component
    this._gameStage.next(PlaygroundGameStageEnum.TOSS);
    this._isGameStageToss = true;

    this._dialogRef = this._dialogService.open(PlaygroundGameInitiationDialogComponent, {
      header: 'Welcome to the Playground!',
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
    });

    this._subscription = this._dialogRef.onClose.subscribe((data: any) => {
      console.log('Playground Game Initiation Dialog Closed. Data: ', data);
    });

    // console.log('DialogRef: ', this._dialogRef);
    // console.log('DialogRef getInstance: ', this._dialogService.getInstance(this._dialogRef));
  }

  private timer() {

    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStageEnum) => stage === PlaygroundGameStageEnum.OTHER),
      switchMap(() => this.doHandleOtherGameStages())
    )
  }


  private placeBets(): Observable<number | boolean> {
    // This method should return the graphic(Place Bets Modal or Image/Gif) to be shown on screen and not the bet amounts of players.

    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStageEnum) => stage === PlaygroundGameStageEnum.BET),
      switchMap(() => this.doGameBetting())
    );
  }

  private rules() {

    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStageEnum) => stage === PlaygroundGameStageEnum.RULES),
      switchMap(() => this.doGameRulesRevelation())
    )
  }

  private toss() {

    return this.gameStage$.pipe(
      filter((stage) => stage === PlaygroundGameStageEnum.TOSS),
      switchMap(() => forkJoin({ test: this.doGameToss() })
      ),
    );
  }

  private deckShuffling() {
    return this.gameStage$.pipe(
      filter((stage) => stage === PlaygroundGameStageEnum.SHUFFLE),
      switchMap(() => this.doDeckShuffling())
    );
  }

  public distributeCards() {
    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStageEnum) => stage === PlaygroundGameStageEnum.DISTRIBUTE),
      switchMap((stage: PlaygroundGameStageEnum) => this.doDeckDistribution(stage))
    )
  }

  public pickOptions() {
    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStageEnum) => stage === PlaygroundGameStageEnum.PICK),
      switchMap(() => this.doOptionsPicking())
    )
  }

  private chooseOptions() {
    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStageEnum) => stage === PlaygroundGameStageEnum.CHOOSE),
      switchMap(() => this.doCardsChoice())
    )
  }

  private evaluateChoices() {
    return this.gameStage$.pipe(
      filter((stage: PlaygroundGameStageEnum) => stage === PlaygroundGameStageEnum.EVALUATE),
      switchMap(() => this.doEvaluateChoices())
    )
  }

  private setGlobalPlaygroundTimer(startTime: number) {
    this.globalPlaygroundTimer = startTime;

    return interval(1000).pipe(
      takeWhile(() => +this.globalPlaygroundTimer !== 0),
      tap(() => {
        this.globalPlaygroundTimer = +this.globalPlaygroundTimer - 1;
        if (+this.globalPlaygroundTimer % 100 === 99) {
          this.globalPlaygroundTimer = +this.globalPlaygroundTimer - 40;
        }
      })
    );
  }

  private setPlaygroundTimer(startTime: number) {
    this.playgroundTimer = startTime;

    return interval(1000).pipe(
      takeWhile(() => +this.playgroundTimer !== 0),
      tap(() => {
        this.playgroundTimer = +this.playgroundTimer - 1;
        if (+this.playgroundTimer % 100 === 99) {
          this.playgroundTimer = +this.playgroundTimer - 40;
        }
      })
    );
  }

  public commenceRound() {
    return merge(
      this.timer(),
      this.rules(),
      this.toss(),
      this.placeBets(),
      this.deckShuffling(),
      this.distributeCards(),
      this.pickOptions(),
      this.chooseOptions(),
      this.evaluateChoices());
  }

  public showPlaygroundGameRulesDialog(): void {
    this._dialogRef = this._dialogService.open(PlaygroundGameRulesDialogComponent, {
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
    });

    this._subscription = this._dialogRef.onClose.subscribe((data: any) => {
      this.showPlaygroundGameInitiationDialog();

      if (this._playgroundService.createPlayground) {
      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.RULES, message: PlaygroundGameStageEnum.RULES, messageFrom: 'peer' } as GameMidSegueMetadata))
      }

      // console.log('Playground Game Rules Dialog Closed. Data: ', data);
    });

    // console.log('DialogRef: ', this._dialogRef);
    // console.log('DialogRef getInstance: ', this._dialogService.getInstance(this._dialogRef));
  }

  private doHandleOtherGameStages() {
    return this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => (metaData?.gameStage === PlaygroundGameStageEnum.OTHER)),
      tap((metaData?: GameMidSegueMetadata) => {
        switch(metaData?.gameStagePhase) {
          case PlaygroundGameStagePhaseEnum.OPPONENTNAME: {
            this._playgroundService.opponentName = metaData.message;
            break;
          }

          case PlaygroundGameStagePhaseEnum.TIMER: {
            this._globalPlaygroundTimerSubscription?.unsubscribe();
            this._globalPlaygroundTimerSubscription = this.setGlobalPlaygroundTimer(metaData.message).pipe(
              takeLast(1),
              tap(() => this._globalPlaygroundTimerSubscription?.unsubscribe())
            ).subscribe();
            // console.log('subscription: ', this._globalPlaygroundTimerSubscription);
            break;
          }

          case PlaygroundGameStagePhaseEnum.MIDSEGUEMESSAGES: {
            this._globalPlaygroundMidSegueMessagesSubscription?.unsubscribe();
            this.showWaitingHeader = true;
            this._globalPlaygroundMidSegueMessagesSubscription = this.showMessagesOnRegularIntervals(metaData).pipe(
              takeLast(1),
              tap((data) => {
                console.log('Heree: ', data);
                this.showWaitingHeader = false;
                this.midSegueMessages = '';
                this.waitingZoneHeader = '';
              })
            ).subscribe();
            break;
          }

          case PlaygroundGameStagePhaseEnum.REDISTRIBUTECARDS: {
            this.mapCardsList(metaData);
            break;
          }

          case PlaygroundGameStagePhaseEnum.UPDATEINSPECTVOIDEDCARDSCOUNTER: {
            this.opponentVoidListInspectionCounter = metaData.message;
            break;
          }

          case PlaygroundGameStagePhaseEnum.GAMEWINNER: {
            this.terminateConnection(true);
            break;
          }

          default: {
            break;
          }
        }
      }));
  }

  private doGameRulesRevelation() {
    return this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => (metaData?.gameStage === PlaygroundGameStageEnum.RULES)),
      tap((metadata?: GameMidSegueMetadata) => {
        if (metadata?.gameStage === PlaygroundGameStageEnum.RULES) {
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
        if(tossOutcome === PlaygroundGameTossOutcomeEnum.PLAYER_1) {
          // TODO: Alongside the below line, call the 'peerConnection's send method'
          this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcomeEnum, messageFrom: 'peer' } as GameMidSegueMetadata));
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcomeEnum, tossMessage: this.playerTossWinner as PlaygroundGameTossOutcomeEnum, messageFrom: 'subject' } as GameMidSegueMetadata);
        } else {
          // TODO: Alongside the below line, call the 'peerConnection's send method'
          this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcomeEnum, messageFrom: 'peer' } as GameMidSegueMetadata));
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: this.playerTossWinner as PlaygroundGameTossOutcomeEnum, tossMessage: this.playerTossWinner as PlaygroundGameTossOutcomeEnum, messageFrom: 'subject' } as GameMidSegueMetadata);
        }
      }
    }

    let toggleSwitch = false;

    const interval$ = interval(500).pipe(
    (this._playgroundService.createPlayground ? take(10) : takeUntil((this._playgroundService.tossCompleted))),
    tap(() => {
      toggleSwitch = !toggleSwitch;
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: toggleSwitch ? PlaygroundGameTossOutcomeEnum.PLAYER_1 : PlaygroundGameTossOutcomeEnum.PLAYER_2, tossMessage: toggleSwitch ? PlaygroundGameTossOutcomeEnum.PLAYER_1 : PlaygroundGameTossOutcomeEnum.PLAYER_2, messageFrom: 'subject' } as GameMidSegueMetadata);
    }));

    const gameOrder$ = of(toggleSwitch).pipe(
      tap(() => setPlayerOrder(getRandomOrder())));

    const gameTossResult$ = this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => (metaData?.gameStage === PlaygroundGameStageEnum.RULES || metaData?.gameStage ===  PlaygroundGameStageEnum.TOSS)),
      tap((metaData?: GameMidSegueMetadata) => {
        if (metaData !== undefined) {
          this._playgroundService.ngZone.run(() => {
            if (metaData.gameStage === PlaygroundGameStageEnum.TOSS) {
              this.playerTossWinner = metaData.message; // NOTE: Contains either 'PlaygroundTossOutcome.PLAYER_1' or 'PlaygroundTossOutcome.PLAYER_2' in 'message'.
              this._gameTossWinnerDetails = this.playerTossWinner === PlaygroundGameTossOutcomeEnum.PLAYER_1
                ? this._playgroundService.createPlayground ? `${this.playerName} Wins the Toss! Begins first!!` : `${this.opponentName} Wins the Toss! Begins first!!`
                : this._playgroundService.createPlayground ? `${this.opponentName} Wins the Toss! Begins first!!` : `${this.playerName} Wins the Toss! Begins first!!`
            }

            if (this._playgroundService.createPlayground) {
              this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: PlaygroundGameStagePhaseEnum.COMPLETED, messageFrom: 'subject' });
            }

            // console.log('gameTossWinnerDetails: ', this._gameTossWinnerDetails);
          });
        }
      }),
    delay(5000),
    tap((metaData: GameMidSegueMetadata | undefined) => {
      // console.log('delay: ', metaData);
    }));

    return concat(
      interval$,
      this._playgroundService.createPlayground ? gameOrder$ : of(),
      gameTossResult$
    );
  }

  private doGameBetting() {
    this.playgroundCreatorBetAmount = 10;

    const interval$ = this.setPlaygroundTimer(200);

    const bettingCompleted$ = of(+this.playgroundTimer === 0).pipe(
      takeWhile(() => !this.isBettingCompleted),
      tap(() => {
        this.playgroundCreatorBetAmount = !!this.playgroundCreatorBetAmount || this.playgroundCreatorBetAmount < 10 ? 10 : this.playgroundCreatorBetAmount;
        this.beginDeckShuffling();
        console.log('Timeout!');
      })
    )

    return this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => metaData?.gameStage === PlaygroundGameStageEnum.BET),
      tap((metaData?: GameMidSegueMetadata) => (this.playgroundJoinerBetAmount = metaData?.betAmount ?? this.playgroundJoinerBetAmount, console.log('playgroundBetAmount: ', this.playgroundJoinerBetAmount, 'metaDataBetAmount: ', metaData?.betAmount))),
      switchMap(() =>
        concat(
          interval$,
          bettingCompleted$
        ))
    );
  }

  private doDeckShuffling() {

    const tossWinningPlayer = (): boolean => {
      if (this._playgroundService.createPlayground) {
        if (this.playerTossWinner === PlaygroundGameTossOutcomeEnum.PLAYER_1) {
          return true;
        }
      } else {
        if (this.playerTossWinner === PlaygroundGameTossOutcomeEnum.PLAYER_2) {
          return true;
        }
      }
      this.shuffleDeckHeader = 'Waiting for your partner to begin...';
      return false;
    }

    let metaDataMessage, beginShuffle;
    const waitBeforeShuffling$ = this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => metaData?.gameStage === PlaygroundGameStageEnum.SHUFFLE),
      takeWhile((metaData?: GameMidSegueMetadata) => {
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
    );

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
        this._gameStage.next(PlaygroundGameStageEnum.DISTRIBUTE);

        if (this.isDeckShufflerPlayer) {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.DISTRIBUTE, message: PlaygroundGameStageEnum.DISTRIBUTE, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, messageFrom: 'subject' } as GameMidSegueMetadata);
        }
      }));

    return concat(
      waitBeforeShuffling$,
      shuffleDeck$
    )

  }

  private doDeckDistribution(_stage: PlaygroundGameStageEnum) {

    return this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => (metaData?.gameStage === PlaygroundGameStageEnum.DISTRIBUTE)),
      switchMap((metaData?: GameMidSegueMetadata) => {
        if (metaData?.gameStagePhase === PlaygroundGameStagePhaseEnum.INITIAL) {
          return of(metaData).pipe(
            tap((metaData) => {
              if (metaData.message && !this.isDeckShufflerPlayer) {
                this.mapCardsList(metaData);
              }
            }),
            // NOTE - Create Options PickList for the Player.
            tap(() => this.createPicklistForPlayer()),
            tap(() => (this.isShuffleDeckInitiated = false, this.isOptionsPickerInitiated = true, this.cardDeckPickerHeader = 'You can have a look at the cards assigned.')),
            delay(4000),
            tap(() => (this.cardDeckPickerHeader = 'Pick suitable options from the ones presented!')),
            delay(1000),
            tap(() => {
              this.isOptionsPickerInitiated = false;
              this.showMidSegueMessages = true;
              this.midSegueMessages = 'You can have a look at the cards assigned.';
              window.scrollTo(0, (document.body.scrollHeight * 0.51));
            }),
            delay(500),
            tap(() => this.increaseZIndexCards = true),
            delay(1000),
            tap(() => (this.midSegueMessages = 'Pick suitable options from the ones presented!')),
            delay(500),
            tap(() => this.increaseZIndexPicker = true),
            tap(() => {
              if (this.isDeckShufflerPlayer) {
                this._gameStage.next(PlaygroundGameStageEnum.PICK);
                this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.PICK, message: PlaygroundGameStageEnum.PICK, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, messageFrom: 'subject' } as GameMidSegueMetadata);
              } else {
                this._gameStage.next(PlaygroundGameStageEnum.CHOOSE);
              }
            }));
        } else if (metaData?.gameStagePhase === PlaygroundGameStagePhaseEnum.INTERMEDIATE) {
          return of();
        } else {
          return of();
        }
      })
    );
  }

  private doOptionsPicking() {
    return this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => (metaData?.gameStage === PlaygroundGameStageEnum.PICK)),
      tap((metaData?: GameMidSegueMetadata) => {

        console.log('PICK GameStage: ', metaData?.message);

        this.showMidSegueMessages = false;
        this.showPlayerSegueMessages = true;
        this.showBackdrop = true;
        this.enableWaitingZone = true;
        this.showWaitingHeader = false;
        this.increaseZIndexVoidedCards = false;
        this.globalPlaygroundTimer = 200;

        this.midSegueMessages = 'Pick suitable options from the ones presented!';

        this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.OTHER, message: this.globalPlaygroundTimer, gameStagePhase: PlaygroundGameStagePhaseEnum.TIMER, messageFrom: 'peer' } as GameMidSegueMetadata))
        this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.CHOOSE, message: PlaygroundGameStageEnum.CHOOSE, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, messageFrom: 'peer' } as GameMidSegueMetadata))

        this._globalPlaygroundTimerSubscription?.unsubscribe();
        this._globalPlaygroundTimerSubscription = this.setGlobalPlaygroundTimer(+this.globalPlaygroundTimer).pipe(
          takeLast(1),
          tap(() => {
            this.hideVoidedCards();
            this.unsubscribeAllAndResetCounter();

            // If nothing is selected by DeckShufflerWinner Player then choose from initial values as default
            if (this.playerFalsySelectedList.length < 3) {
              this.playerFalsySelectedList = Array.from(this.playerFalsyPickList.keys()).slice(0, 3);
            }

            if (!this.playerTruthySelectedList) {
              this.playerTruthySelectedList = Array.from(this.playerTruthyPickList.keys())[0];
            }

            this.buildUp3LiesAndATruth(true);

            console.log('playerFalsySelectedList: ', this.playerFalsySelectedList);
            console.log('playerTruthySelectedList: ', this.playerTruthySelectedList);

            this.midSegueMessages = 'Waiting for your partner to finish choosing from your submitted options...';
            this.waitingZoneHeader = 'Waiting for your partner to finish choosing from your submitted options...';

            this.notifyAndWaitForPartnerToChoose();
          })).subscribe();

      }));
  }

  private doCardsChoice() {
    return this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => (metaData?.gameStage === PlaygroundGameStageEnum.CHOOSE)),
      tap((metaData?: GameMidSegueMetadata) => {
        switch (metaData?.gameStagePhase) {
          case PlaygroundGameStagePhaseEnum.INITIAL: {
            // console.log('CHOOSE GameStage: ', metaData?.message);

            this.showMidSegueMessages = true;
            this.showPlayerSegueMessages = false;
            this.showBackdrop = false;
            this.enableWaitingZone = true;
            this.showWaitingHeader = true;

            this.waitingZoneHeader = 'Waiting for your partner to finish picking options...';
            this.midSegueMessages = 'Waiting for your partner to finish picking options...';
          }
            break;

          case PlaygroundGameStagePhaseEnum.INTERMEDIATE: {
            if (metaData.message) {
              this.enableWaitingZone = true;
              this.showWaitingHeader = true;
              this.increaseZIndexVoidedCards = true;

              this.midSegueMessages = 'Waiting for your partner to finish picking options...';
              this.waitingZoneHeader = 'Waiting for your partner to finish picking options...';

              this.opponentPickList = new Map(metaData.message.opponentPickList);
              this.opponentFalsySelectedList = metaData.message.opponentFalsySelectedList;
              this.opponentTruthySelectedList = metaData.message.opponentTruthySelectedList;

              this._globalPlaygroundTimerSubscription?.unsubscribe();
              this._globalPlaygroundTimerSubscription = this.setGlobalPlaygroundTimer(metaData?.message.globalPlaygroundTimer).pipe(
              takeLast(1),
              tap(() => {
                this.hideVoidedCards();
                this.unsubscribeAllAndResetCounter();
                this.chooseAnyOptions();

                // NOTE: Here 'isPicker' is set to 'true', because the one calling the evaluatePickedOptions() method is the Player choosing the options provided and calling evaluation. This message is post evaluation to be notified to the Player who provided the Picklist.
                this._gameStage.next(PlaygroundGameStageEnum.EVALUATE);
                this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.EVALUATE, message: { gameStage: PlaygroundGameStageEnum.EVALUATE, destroyAll: !this.toggleBetweenLiesOrTruth }, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, isPicker: true, messageFrom: 'peer' } as GameMidSegueMetadata);
              })).subscribe();

              // console.log('opponentPickList: ', this.opponentPickList, 'opponentFalsySelectedList: ', this.opponentFalsySelectedList, 'opponentTruthySelectedList: ', this.opponentTruthySelectedList);
            }
          }
          break;
        }
      }),
      delay(1800),
      tap((metaData?: GameMidSegueMetadata) => {
        if (metaData?.gameStagePhase === PlaygroundGameStagePhaseEnum.INITIAL) {
          this.waitingZoneHeader = 'You will be redirected to next game phase when the timer runs out.';

          // NOTE: Below line works
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.OTHER, message: PlaygroundGameStageEnum.CHOOSE, gameStagePhase: PlaygroundGameStagePhaseEnum.MIDSEGUEMESSAGES, messageFrom: 'peer' } as GameMidSegueMetadata);
        } else if (metaData?.gameStagePhase === PlaygroundGameStagePhaseEnum.INTERMEDIATE) {
          this.waitingZoneHeader = 'You will be redirected to next game phase when the timer runs out.';
        }
      }),
      delay(1800),
      tap((metaData?: GameMidSegueMetadata) => {
        if (metaData?.gameStagePhase === PlaygroundGameStagePhaseEnum.INITIAL) {
          this.showWaitingHeader = false;
        } else if (metaData?.gameStagePhase === PlaygroundGameStagePhaseEnum.INTERMEDIATE) {
          this.showWaitingHeader = false;
        }
      }));
  }

  private doEvaluateChoices() {
    return this.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => (metaData?.gameStage === PlaygroundGameStageEnum.EVALUATE)),
      tap((_metaData?: GameMidSegueMetadata) => {
        this.showWaitingHeader = true;
        this.waitingZoneHeader = 'Evaluating result please wait...!';
        this.midSegueMessages = 'Evaluating result please wait...!';
      }),
      delay(1800),
      tap((metaData?: GameMidSegueMetadata) => {
        this.increaseZIndexVoidedCards = false;
        this.showWaitingHeader = true;
        if (metaData?.isPicker) {
          this.evaluatePickedOptions(metaData);
        } else {
          this.hideVoidedCards();
          this.unsubscribeAllAndResetCounter();
        }
        if (metaData?.message.playerGameStageWinner === this.whoAmI) {
          // NOTE: Check this betAmount Logic once!
          this.playgroundCreatorBetAmount += Math.abs(this.playgroundJoinerBetAmount);
          this.playgroundJoinerBetAmount -= Math.abs(this.playgroundCreatorBetAmount);
          this._playgroundService.messageService.add({ severity: 'success', summary: 'Success', detail: 'You win this round!😊' });
          this._playgroundService.messageService.add({ severity: 'success', summary: 'Achievement: Bounty Winner!🤴🏻', detail: 'Your will receive your opponent\'s bounty amount!🤑' });
          this._playgroundService.messageService.add({ severity: 'success', summary: 'Achievement: Card Destroyer!😈', detail: 'Your opponent\'s cards will be destroyed following your round victory!😎' });
        } else {
          this.playgroundJoinerBetAmount += Math.abs(this.playgroundCreatorBetAmount);
          this.playgroundCreatorBetAmount -= Math.abs(this.playgroundJoinerBetAmount);
          this._playgroundService.messageService.add({ severity: 'error', summary: 'Error', detail: 'You lost this round!😟' });
          this._playgroundService.messageService.add({ severity: 'error', summary: 'Achievement: Bounty Loser!😭', detail: 'Your opponent will receive your bounty amount!🙄' });
          this._playgroundService.messageService.add({ severity: 'error', summary: 'Achievement: Self Destructor!🤡', detail: 'Your cards will be destroyed following your round loss!😑' });
          this.waitingZoneHeader = 'Destroying Your Cards';
          this.midSegueMessages = 'Destroying Your Cards';
        }
      }),
      delay(1800),
      tap((metaData?: GameMidSegueMetadata) => {
        if (metaData?.message.playerGameStageWinner !== this.whoAmI) {
          this.playerGameStageWinner = metaData?.message.playerGameStageWinner;
          this.reDistributeCardsPostEvaluation(metaData?.message.destroyAll);
          this.waitingZoneHeader = 'Redistributing Cards to you';
          this.midSegueMessages = 'Redistributing Cards to you';
        }
      }),
      delay(1800),
      tap((metaData?: GameMidSegueMetadata) => {
        this.globalPlaygroundRoundCounter += 1;
        this.waitingZoneHeader =`Commencing Round ${this.globalPlaygroundRoundCounter}`;
        this.midSegueMessages = `Commencing Round ${this.globalPlaygroundRoundCounter}`;

        this._playgroundService.switch.forEach(() => this._playgroundService.switch.next(undefined));
        this.enableSubmitOptionsButton = true;
        this.toggleBetweenLiesOrTruth = false;

        this.playerFalsySelectedList = [];
        this.playerTruthySelectedList = undefined;
        this.choicesSelectedList = undefined;
        this.opponentFalsySelectedListTemp = [];
        this.opponentTruthySelectedListTemp = undefined;

        if (!metaData?.isPicker) {
          this._gameStage.next(PlaygroundGameStageEnum.CHOOSE);
          this.showPlayerSegueMessages = false;
          this.increaseZIndexCards = true;
          this.increaseZIndexVoidedCards = true;
        } else {
          this._gameStage.next(PlaygroundGameStageEnum.PICK);
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.PICK, message: PlaygroundGameStageEnum.PICK, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, messageFrom: 'subject' } as GameMidSegueMetadata);
        }
      }),
      delay(1800),
      tap((_metaData?: GameMidSegueMetadata) => this.showWaitingHeader = false)
    );
  }

  // ===========================================================================
  // Event Handlers for Button Clicks
  // ===========================================================================

  public initializeBetting(): void {
    this._isGameStageToss = false;
    this._gameStage.next(PlaygroundGameStageEnum.BET);
    this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.BET, message: PlaygroundGameStagePhaseEnum.INITIAL, messageFrom: 'subject' } as GameMidSegueMetadata);
  }

  public beginDeckShuffling(): void {
    this.playgroundTimer = 0;
    this.isBettingCompleted = true;
    this.isShuffleDeckInitiated = true;
    this.isShufflePending = false;
    this._dialogService.getInstance(this._dialogRef!).hide();
    this.showBackdrop = true;
    this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.BET, message: this.playgroundCreatorBetAmount, messageFrom: 'peer' } as GameMidSegueMetadata))
    this._gameStage.next(PlaygroundGameStageEnum.SHUFFLE);

    this.isDeckShufflerPlayer = true;

    if (this.playerTossWinner === PlaygroundGameTossOutcomeEnum.PLAYER_1 && this._playgroundService.createPlayground) {
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.SHUFFLE, message: PlaygroundGameStageEnum.SHUFFLE, beginShuffle: true, messageFrom: 'subject' } as GameMidSegueMetadata);
      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.SHUFFLE, message: PlaygroundGameStageEnum.SHUFFLE, messageFrom: 'peer' } as GameMidSegueMetadata));
    } else if (this.playerTossWinner === PlaygroundGameTossOutcomeEnum.PLAYER_2 && !this._playgroundService.createPlayground) {
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.SHUFFLE, message: PlaygroundGameStageEnum.SHUFFLE, beginShuffle: true, messageFrom: 'subject' } as GameMidSegueMetadata);
      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.SHUFFLE, message: PlaygroundGameStageEnum.SHUFFLE, messageFrom: 'peer' } as GameMidSegueMetadata));
    } else {
      this.isDeckShufflerPlayer = false;
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.SHUFFLE, message: '', beginShuffle: false, messageFrom: 'subject' } as GameMidSegueMetadata);
    }
  }

  private unsubscribeAllAndResetCounter(): void {
    this.globalPlaygroundTimer = 0;
    this._globalPlaygroundTimerSubscription?.unsubscribe();
    this._globalPlaygroundMidSegueMessagesSubscription?.unsubscribe();
    this.enableSubmitOptionsButton = false;
  }

  private distributeDeckCards(_player?: PlaygroundGameTossOutcomeEnum): void {

    const firstPlayerCardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();
    const secondPlayerCardsList: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();

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

    this.playerTossWinner === PlaygroundGameTossOutcomeEnum.PLAYER_1 ? (this.p1CardsList = firstPlayerCardsList, this.p2CardsList = secondPlayerCardsList) : (this.p1CardsList = secondPlayerCardsList, this.p2CardsList = firstPlayerCardsList);

    this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.DISTRIBUTE, message: { p1CardsList: Array.from(this.p1CardsList.entries()), p2CardsList: Array.from(this.p2CardsList.entries()), deckCardsList: Array.from(this.deckCardsList.entries()), voidDeckCardsList: Array.from(this.voidDeckCardsList.entries()) }, messageFrom: 'peer' } as GameMidSegueMetadata))
  }

  private mapCardsList(metaData: GameMidSegueMetadata): void {
    this.p1CardsList = new Map(metaData.message.p1CardsList);
    this.p2CardsList = new Map(metaData.message.p2CardsList);
    this.deckCardsList = new Map(metaData.message.deckCardsList);
    this.voidDeckCardsList = new Map(metaData.message.voidDeckCardsList);

    // console.log('PlayerCardsList: ', this.playerCardsList);
    // console.log('PlayerFalsyPickList: ', this.playerFalsyPickList);
    // console.log('PlayerFalsySelectedList: ', this.playerFalsySelectedList);
    // console.log('PlayerTruthyPickList: ', this.playerTruthyPickList);
    // console.log('PlayerTruthySelectedList: ', this.playerTruthySelectedList);
    // console.log('Deck Cards List: ', this.deckCardsList);
    // console.log('Void Cards List: ', this.voidDeckCardsList);
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
        break;
      }
    }

    this.playerFalsyPickList = playerPicklist;
    this.playerTruthyPickList = this.playerCardsList;

    // console.log('PlayerCardsList: ', this.playerCardsList);
    // console.log('PlayerFalsyPickList: ', this.playerFalsyPickList);
    // console.log('PlayerTruthyPickList: ', this.playerTruthyPickList);
  }

  private buildUp3LiesAndATruth(nerfMe: boolean = false) {

    let randomNumber = 0, index = 0;
    this.opponentPickList.clear();

    randomNumber = nerfMe ? (Math.floor(Math.random() * 3) + 1) : 3;

    while(true) {
      if (index === randomNumber) {
        this.opponentPickList.set(this.playerTruthySelectedList!, this.playerTruthyPickList.get(this.playerTruthySelectedList!)!);
      }

      if (this.opponentPickList.size === 4) {
        break;
      } else {
          this.opponentPickList.set(this.playerFalsySelectedList[index], this.playerFalsyPickList.get(this.playerFalsySelectedList[index])!);

      }

      index++;
    }

  }

  private notifyAndWaitForPartnerToChoose() {

      this.globalPlaygroundTimer = 200;
      this.midSegueMessages = 'Waiting for your partner to finish choosing from your submitted options...';
      this.waitingZoneHeader = 'Waiting for your partner to finish choosing from your submitted options...';

      this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.OTHER, message: this.globalPlaygroundTimer, gameStagePhase: PlaygroundGameStagePhaseEnum.TIMER, messageFrom: 'peer' } as GameMidSegueMetadata);
      this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.OTHER, message: PlaygroundGameStageEnum.CHOOSE, gameStagePhase: PlaygroundGameStagePhaseEnum.MIDSEGUEMESSAGES, messageFrom: 'peer' } as GameMidSegueMetadata);

      // console.log('opponentPickList: ', this.opponentPickList);
      // console.log('Success!!!!');

      // NOTE: The below code is commented since we need to have control over what happens when the timer runs out. Here the logic to apply timer is simple, the one who needs to perform some action or task when timer runs out need not use Subject to initiate timer, rather call it explicitly by subscribing to it. Whereas, for the other partner, just initiate timer using the subject.
      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.CHOOSE,
        message: { opponentFalsyPickList: Array.from(this.playerFalsyPickList.entries()), opponentFalsySelectedList: this.playerFalsySelectedList, opponentTruthyPickList: Array.from(this.playerTruthyPickList.entries()), opponentTruthySelectedList: this.playerTruthySelectedList, opponentPickList: Array.from(this.opponentPickList.entries()), globalPlaygroundTimer: this.globalPlaygroundTimer },
        gameStagePhase: PlaygroundGameStagePhaseEnum.INTERMEDIATE, messageFrom: 'peer' } as GameMidSegueMetadata));
  }

  private chooseAnyOptions() {
    this.toggleBetweenLiesOrTruth = !!Math.floor(Math.random() * 2);

    if (!this.toggleBetweenLiesOrTruth) {
      this.choicesSelectedList = Array.from(this.opponentPickList.keys())[0];
    } else {
      this.choicesSelectedList = Array.from(this.playerFalsyPickList.keys()).slice(0, 3);
    }
  }

  private evaluatePickedOptions(metaData: GameMidSegueMetadata) {
    let result;
    let destroyAll: boolean = false;

    if (!this.toggleBetweenLiesOrTruth) { // NOTE: !this.toggleBetweenLiesOrTruth means TRUE (here in this context) and this.toggleBetweenLiesOrTruth means FALSE (in this context)
      if (this.choicesSelectedList && this.opponentTruthySelectedList) {
        result = +this.choicesSelectedList === +this.opponentTruthySelectedList;
        destroyAll = true;
      }
    } else {
      if (this.choicesSelectedList && this.opponentFalsySelectedList.length) {
        result = (this.choicesSelectedList as any[]).every(item => this.opponentFalsySelectedList.includes(item));
        destroyAll = false;
      }
    }

    this.playerGameStageWinner = !!result ? +this.whoAmI : +this.whoIsOpponent;

    // NOTE: Here 'isPicker' is set to 'false', because the one calling the evaluatePickedOptions() method is the Player choosing the options provided and calling evaluation. This message is post evaluation to be notified to the Player who provided the Picklist.
    this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.EVALUATE, message: { playerGameStageWinner: this.playerGameStageWinner, destroyAll: destroyAll }, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, isPicker: false, messageFrom: 'peer' } as GameMidSegueMetadata));

    // console.log('Winner of this Game Stage is: ', this.playerGameStageWinner);

    metaData.message.destroyAll = destroyAll;
    metaData.message.playerGameStageWinner = this.playerGameStageWinner;
  }

  /*
   * opponentFalsySelectedList is Opponent's False List
   * opponentTruthySelectedList is Opponent's Truth List
   * playerFalsySelectedList is Player's False List
   * playerTruthySelectedList is Player's Truth List
   * playerFalsyPickList is Player's False Pick List provided by Opponent
   * playerTruthyPickList is Player's Truth Pick List provided by Opponent
   */

  private reDistributeCardsPostEvaluation(destroyAll: boolean) {
    // NOTE: Distributing Cards to Player 1 first and next to Player 2
    if (destroyAll) { // NOTE: Since we only call this method on loss, therefore, we are simply calling upon the 'playerCardsList' and deleting cards from it
      this.playerCardsList.clear();
    } else {
      (this.choicesSelectedList as any[])?.forEach(key => {
        if (this.opponentFalsySelectedList.includes(key)) {
          this.playerCardsList.delete(key);
        }
      })
    }

    if (this.deckCardsList.size !== 0 && this.deckCardsList.size >= this.playerCardsList.size) {
      while(true) {
        const randomNumber = Math.floor(Math.random() * 53) + 1;
        if (this.playerCardsList.size === 4) {
          break;
        }

        if (this.deckCardsList.has(randomNumber)) {
          if (this.playerCardsList.size === 0) {
            this.playerCardsList.set(randomNumber, CardDeckEnum[randomNumber]);
          } else {
            if (!this.playerCardsList.has(randomNumber)) {
              this.playerCardsList.set(randomNumber, CardDeckEnum[randomNumber]);
            }
          }
          this.deckCardsList.delete(randomNumber);
          this.voidDeckCardsList.set(randomNumber, CardDeckEnum[randomNumber]);
        }
      }

      this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.OTHER, message: { p1CardsList: Array.from(this.p1CardsList.entries()), p2CardsList: Array.from(this.p2CardsList.entries()), deckCardsList: Array.from(this.deckCardsList.entries()), voidDeckCardsList: Array.from(this.voidDeckCardsList.entries()) }, gameStagePhase: PlaygroundGameStagePhaseEnum.REDISTRIBUTECARDS, messageFrom: 'peer' } as GameMidSegueMetadata))
    } else {
      this.terminateConnection(false);

      // console.log('Deck ke Cards khatam ho gae!');
    }

  }

  private showMessagesOnRegularIntervals(gameStage: GameMidSegueMetadata): Observable<number> {
    return interval(5000).pipe(
      takeWhile(() => +this.globalPlaygroundTimer !== 0),
      tap((count) => {
        if (count % 2 === 0) {
          if (gameStage.message === PlaygroundGameStageEnum.PICK) {
            this.midSegueMessages = 'Pick suitable options from the ones presented!';
          } else if (gameStage.message === PlaygroundGameStageEnum.CHOOSE)  {
            if (gameStage.gameStagePhase === PlaygroundGameStagePhaseEnum.INITIAL) {
              this.midSegueMessages = 'Waiting for your partner to finish picking options...';
              this.waitingZoneHeader = 'Waiting for your partner to finish picking options...';
            } else if (gameStage.gameStagePhase === PlaygroundGameStagePhaseEnum.INTERMEDIATE) {
              this.midSegueMessages = 'Waiting for your partner to finish choosing from your submitted options...';
              this.waitingZoneHeader = 'Waiting for your partner to finish choosing from your submitted options...';
            }
          }
        } else {
          this.midSegueMessages = 'You will be redirected to next game phase when the timer runs out.';
          this.waitingZoneHeader = 'You will be redirected to next game phase when the timer runs out.';
        }
      }));
  }

  public submitOptions(gameStage: PlaygroundGameStageEnum): void {
    if (gameStage === PlaygroundGameStageEnum.PICK) {
      if (this.playerFalsySelectedList.length === 3 && !!this.playerTruthySelectedList) {
        this.hideVoidedCards();
        this.unsubscribeAllAndResetCounter();

        this._gameStage.next(PlaygroundGameStageEnum.EVALUATE);
        this.buildUp3LiesAndATruth(true);
        this.notifyAndWaitForPartnerToChoose();
      } else {
        this.toggleBetweenLiesOrTruth = !this.toggleBetweenLiesOrTruth;
      }
    } else if (gameStage === PlaygroundGameStageEnum.CHOOSE) {
      this.hideVoidedCards();
      this.confirmChoiceSubmission();
    }

  }

  private confirmChoiceSubmission(): void {
    this._playgroundService.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'Please confirm to proceed.',
      accept: () => {
        console.log('Shabbash Bete!! Bery Good!!!!');
        this.hideVoidedCards();
        this.unsubscribeAllAndResetCounter();

        // NOTE: Here 'isPicker' is set to 'true', because the one calling the evaluatePickedOptions() method is the Player choosing the options provided and calling evaluation. This message is post evaluation to be notified to the Player who provided the Picklist.
        this._gameStage.next(PlaygroundGameStageEnum.EVALUATE);
        this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.EVALUATE, message: { gameStage: PlaygroundGameStageEnum.EVALUATE, destroyAll: !this.toggleBetweenLiesOrTruth }, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, isPicker: true, messageFrom: 'peer' } as GameMidSegueMetadata);
      },
      reject: () => {
        return false;
      }
    });
  }

  public resetChoicesListOnToggle(): void {
    this.choicesSelectedList = undefined;
  }

  public showVoidedCards(): void {
    this._playgroundService.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'Proceeding will reduce your Voided Deck Inspection chances by 1!',
      accept: () => {
        this.showMidSegueMessages = false;
        this.showVoidedCardsList = true;
        this.playerVoidListInspectionCounter--;

        this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.OTHER, message: this.playerVoidListInspectionCounter, gameStagePhase: PlaygroundGameStagePhaseEnum.UPDATEINSPECTVOIDEDCARDSCOUNTER, messageFrom: 'peer' } as GameMidSegueMetadata));
        this._playgroundService.messageService.add({ severity: 'warn', summary: 'Warning', detail: `Your remaining chances of inspecting the Voided Deck left are: ${this.playerVoidListInspectionCounter}` });
      },
      reject: () => {
        return false;
      }
    });
  }

  public hideVoidedCards(): void {
    this.showMidSegueMessages = true;
    this.showVoidedCardsList = false;
  }

  public terminateConnection(hasWon: boolean): void {
    if (hasWon) {
      this.showWaitingHeader = true;
      this.midSegueMessages = 'You will be redirected to home screen on connection termination!';
      this._playgroundService.messageService.add({ severity: 'success', summary: 'Victory', detail: 'You won the game!😎' });
      // this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.OTHER, message: this.whoIsOpponent, gameStagePhase: PlaygroundGameStagePhaseEnum.GAMEWINNER, messageFrom: 'peer' } as GameMidSegueMetadata));
      this.globalPlaygroundTimer = 0;

      interval(1000).pipe(
        take(1),
        tap(() => this.waitingZoneHeader = 'You won the game!'),
        delay(2000),
        tap(() => this.waitingZoneHeader = 'Good Game, Keep it up!'),
        delay(2000),
        tap(() => this.waitingZoneHeader = `Collect from your opponent the bounty amount - ${this.whoAmI === PlaygroundPlayersEnum.PLAYER_1 ? this.playerOneBetAmount : this.playerTwoBetAmount} bucks!` ),
        delay(2000),
        tap(() => this.waitingZoneHeader = 'Connection with your partner will terminate soon!'),
        delay(4000),
        tap(() => this.waitingZoneHeader = `Collect from your opponent the bounty amount - ${this.whoAmI === PlaygroundPlayersEnum.PLAYER_1 ? this.playerOneBetAmount : this.playerTwoBetAmount} bucks!` ),
        delay(4000),
        tap(() => this.waitingZoneHeader = 'Connection with your partner will terminate soon!'),
        delay(2000)
      ).subscribe(() => {
        this.unsubscribeAllAndResetCounter();
        this.unsubscribeAll();
        this._playgroundService.terminateConnectionFromPlayground();
        this.waitingZoneHeader = 'Connection with your partner terminated!';
      });
    } else {
      this._playgroundService.confirmationService.confirm({
        header: 'Are you sure?',
        message: 'Do you really wish to end the game!? Doing so will result in your loss!',
        accept: () => {
          this.showWaitingHeader = true;
          this.midSegueMessages = 'You will be redirected to home screen on connection termination!';
          this._playgroundService.messageService.add({ severity: 'error', summary: 'Loss', detail: 'You lost the game!😭' });
          this._playgroundService.sendMessageForPlayground(JSON.stringify({ gameStage: PlaygroundGameStageEnum.OTHER, message: this.whoIsOpponent, gameStagePhase: PlaygroundGameStagePhaseEnum.GAMEWINNER, messageFrom: 'peer' } as GameMidSegueMetadata));
          this.globalPlaygroundTimer = 0;

          interval(1000).pipe(
            take(1),
            tap(() => (this.showWaitingHeader = true, this.waitingZoneHeader = 'You lost the game!')),
            delay(2000),
            tap(() => (this.showWaitingHeader = true, this.waitingZoneHeader = 'Better luck next time!')),
            delay(2000),
            tap(() => (this.showWaitingHeader = true, this.waitingZoneHeader = `Pay your opponent the bounty amount - ${this.whoAmI === PlaygroundPlayersEnum.PLAYER_1 ? this.playerTwoBetAmount : this.playerOneBetAmount} bucks!` )),
            delay(2000),
            tap(() => (this.showWaitingHeader = true, this.waitingZoneHeader = 'Connection with your partner will terminate soon!')),
            delay(4000),
            tap(() => (this.showWaitingHeader = true, this.waitingZoneHeader = `Pay your opponent the bounty amount - ${this.whoAmI === PlaygroundPlayersEnum.PLAYER_1 ? this.playerTwoBetAmount : this.playerOneBetAmount} bucks!` )),
            delay(4000),
            tap(() => (this.showWaitingHeader = true, this.waitingZoneHeader = 'Connection with your partner will terminate soon!')),
            delay(2000)
          ).subscribe(() => {
            this.unsubscribeAllAndResetCounter();
            this.unsubscribeAll();
            this._playgroundService.terminateConnectionFromPlayground();
            this.waitingZoneHeader = 'Connection with your partner terminated!';
          });
        },
        reject: () => {
          return false;
        }
      });
    }
  }

  public unsubscribeAll(): void {
    this._subscription.unsubscribe();
  }

}

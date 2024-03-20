import { concat, delay, map, of, tap } from 'rxjs';

export class PlaygroundModel {

  private _gameToss: boolean = true;
  private _playerOrder: Map<string, number> = new Map<string, number>();

  private _playerOneBetAmount: number = 0;
  private _playerTwoBetAmount: number = 0;


  constructor() {
    this.commenceRound().subscribe();
  }

  get gameToss(): boolean {
    return this._gameToss;
  }
  set gameToss(value: boolean) {
    this._gameToss = value;
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

  public commenceRound() {
    return concat(
      this.toss(),
      this.placeBets());
  }

  public toss() {
    // Toss between Player and Opponent automatically, just show their names as 'Player 1', 'Player 2' as buttons and highlight borders alternatively for like 5 secs and using randomizer just pick between the two Players.
    // Randomizer logic to get Players's order.

    this._playerOrder.set('Player1', 1);
    this._playerOrder.set('Player2', 2);

    this.gameToss = true;
    return of(this.gameToss).pipe(
    delay(5000),
    tap(() => this.gameToss = false),
    map(() => this._playerOrder));

    // const abc = interval(1000);

    // this.gameToss = true;
    // return abc.pipe(
    //   take(5),
    //                 tap(() => this.counter++),
    // delay(5000),
    // tap(() => this.gameToss = false),
    // map(() => this._playerOrder));

    // return of(this._playerOrder);
  }

  public placeBets() {
    // This method should return the graphic(Place Bets Modal or Image/Gif) to be shown on screen and not the bet amounts of players.

    return of();
    // return combineLatest([this.playerOneBet(), this.playerTwoBet()]);
  }


  // public playerOneBet() {
  //   return of(this.playerOneBetAmount);
  // }

  // public playerTwoBet() {
  //   return of(this.playerTwoBetAmount);
  // }

}

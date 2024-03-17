import { concat, of } from 'rxjs';

export class PlaygroundModel {

  private playerOrder: Map<string, number> = new Map<string, number>();

  private _playerOneBetAmount: number = 0;
  private _playerTwoBetAmount: number = 0;


  constructor() {
  }

  get playerOneBetAmount(): number { // Use for data-binding with HTML
    return this._playerOneBetAmount;
  }
  set playerOneBetAmount(value: number) {
    this._playerOneBetAmount = value;
  }

  get playerTwoBetAmount(): number { // Use for data-binding with HTML
    return this.playerTwoBetAmount;
  }
  set playerTwoBetAmount(value: number) {
    this.playerTwoBetAmount = value;
  }

  public commenceRound() {
    return concat(
      this.toss(),
      this.placeBets());
  }

  public toss() {
    // Toss between Player and Opponent automatically, just show their names as 'Player 1', 'Player 2' as buttons and highlight borders alternatively for like 5 secs and using randomizer just pick between the two Players.
    // Randomizer logic to get Players's order.

    this.playerOrder.set('Player1', 1);
    this.playerOrder.set('Player2', 2);
    return of(this.playerOrder);
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

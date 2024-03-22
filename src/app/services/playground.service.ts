import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {

  private static _playgroundMap: Map<number, any> = new Map<number, any>();
  private _playgroundCounter: number = 0;
  private _router: Router;

  private _opponent: Subject<any> = new Subject<any>();
  private _player: Subject<any> = new Subject<any>();

  constructor(private router: Router) {
    this._router = router;
  }

  get opponent$(): Observable<any> {
    return this._opponent.asObservable();
  }

  get player$(): Observable<any> {
    return this._player.asObservable();
  }

  public sendMessageToOpponent(message: any): void {
    this._opponent.next(message);
  }

  public sendMessageToPlayer(message: any): void {
    this._player.next(message);
  }

  joinExistingPlayground(_playgroundId: number, _playerName: string): void {

  }

  createNewPlayground(playerName: string): void {
    this._playgroundCounter = 0;
    if (PlaygroundService._playgroundMap.size > 0) {
      this.createPlayground(playerName);
    } else {
      this.addToPlaygroundMap(playerName);
    }

  }

  private createPlayground(playerName: string): void {
    do {
      if (PlaygroundService._playgroundMap.has(this._playgroundCounter)) {
        this._playgroundCounter++;
      } else {
        this.addToPlaygroundMap(playerName);
        break;
      }
    } while(this._playgroundCounter)
  }

  private addToPlaygroundMap(playerName: string): void {
    const playgroundMetadata = { player1Name: playerName, player1Exists: true, player2Name: '', player2Exists: false, playgroundId: this._playgroundCounter };
    PlaygroundService._playgroundMap.set(this._playgroundCounter, playgroundMetadata)
    this.router.navigate(['playground'], { state: { playgroundMetadata: playgroundMetadata, testId: 123 } })
  }

}

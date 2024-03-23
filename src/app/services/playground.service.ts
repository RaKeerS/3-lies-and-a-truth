import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { GameMetadata, PlayGroundMetadata } from '../types/app-types';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {

  private static _playgroundMap: Map<number, GameMetadata> = new Map<number, GameMetadata>();
  private _playgroundCounter: number = 0;
  private _router: Router;

  private _opponent: Subject<any> = new Subject<any>();
  private _player: Subject<any> = new Subject<any>();

  constructor(private router: Router) {
    this._router = router;
  }

  static get playgroundMap(): Map<number, GameMetadata> {
    return PlaygroundService._playgroundMap;
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

  joinExistingPlayground(playgroundId: number, playerName: string): void {
    if (PlaygroundService._playgroundMap.has(playgroundId)) {
      const gameMetadata: GameMetadata = PlaygroundService._playgroundMap.get(playgroundId)!;
      if (!gameMetadata.playgroundMetadata.player2Exists) {
        gameMetadata.playgroundMetadata.player2Name = playerName;
        gameMetadata.playgroundMetadata.player2Exists = true;

        // Notify Player 2 (and existing Player 1) with the updated PlaygroundMetadata on subscription in the 'playground' component.
        gameMetadata.playgroundSubject.next(gameMetadata.playgroundMetadata);

        this.router.navigate(['playground'], { state: { playgroundId: playgroundId } });
      } else {
        console.log('This game is already ongoing! Joined by someone else already!');
      }
    } else {
      console.log(`Playground with the id - ${playgroundId} does not exist!. Please create a new playground!`);
    }
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
    const playgroundMetadata: PlayGroundMetadata = {
      player1Name: playerName,
      player1Exists: true,
      player2Name: '',
      player2Exists: false,
      playgroundId: this._playgroundCounter
    };

    // Notify Player 1 with the updated PlaygroundMetadata on subscription in the 'playground' component.
    const playgroundSubject: BehaviorSubject<PlayGroundMetadata> = new BehaviorSubject<PlayGroundMetadata>(playgroundMetadata);
    // playgroundSubject.next()
    PlaygroundService._playgroundMap.set(this._playgroundCounter, { playgroundSubject: playgroundSubject, playgroundMetadata: playgroundMetadata })
    // this.router.navigate(['playground'], { state: { playgroundMetadata: playgroundMetadata } });
    this.router.navigate(['playground'], { state: { playgroundId: this._playgroundCounter } });
  }

}

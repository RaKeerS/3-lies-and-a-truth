import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {

  private _opponent: Subject<any> = new Subject<any>();
  private _player: Subject<any> = new Subject<any>();

  constructor() { }

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

}

import { Component, Injector } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { PrimeNgModule } from '../../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-playground-game-rules-dialog',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './playground-game-rules-dialog.component.html',
  styleUrl: './playground-game-rules-dialog.component.scss'
})
export class PlaygroundGameRulesDialogComponent {

  // @Output() commenceGame: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _gameToss: boolean = true;
  private _switch: boolean = false;

  private _dialogRef: DynamicDialogRef;

  active: number = 0;

  constructor(injector: Injector) {
    this._dialogRef = injector.get(DynamicDialogRef);
  }

  get switch(): boolean {
    return this._switch;
  }

  get gameToss(): boolean {
    return this._gameToss;
  }
  set gameToss(value: boolean) {
    this._gameToss = value;
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
//         // this._playerOrder.set('Player1', 1);
//         // this._playerOrder.set('Player2', 2);
//       } else {
//         this._switch = false; // NOTE - Player 2 Wins the Toss, starts first!
//         // this._playerOrder.set('Player1', 2);
//         // this._playerOrder.set('Player2', 1);
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

  moveToGameRounds(): void {
    this.active = 4;
    this._dialogRef.close();
    // this.commenceGame.emit(true);
  }


}

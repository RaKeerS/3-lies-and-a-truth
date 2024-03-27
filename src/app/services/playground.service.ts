import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { WebRtcModel } from '../models/web-rtc/web-rtc.model';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {

  private _createPlayground?: boolean;
  // private _receiver: BroadcastChannel;
  // private peerConnection: any;
  // private _isReady: boolean = false;

  private _localConnection?: RTCPeerConnection;
  private _remoteConnection?: RTCPeerConnection;
  private _chatChannel: any;
  private _sendChannel: any = null;
  private _receiveChannel: any;

  private _message: string = '';

  // private _compressedString: string = '';
  // private _decompressedString: string = '';

  private _signalInvitationToken?: string;

  private _signalInvitationTokenCreated: boolean = false;

  private _webRtc: WebRtcModel;

  // private _signalInvitationTokenCreated: boolean = false;
  // private _message: string = '';
  private _playerName: string = '';

  constructor(private router: Router) {
    this._webRtc = new WebRtcModel(this);
  }

  // get signalInvitationTokenCreated() {
  //   return signalInvitationTokenCreated);
  // }


  get createPlayground(): boolean {
    return !!this._createPlayground;
  }
  set createPlayground(value: boolean) {
    this._createPlayground = value;
  }

  get message(): string {
    return this._message;
  }
  set message(value: string) {
    this._message = value;
  }

  get peerConnection() {
    return this.createPlayground ? this._localConnection : this._remoteConnection;
  }
  set peerConnection(value: any) {
    // this.peerConnection = value;
    this.createPlayground ? this._localConnection = value : this._remoteConnection = value;
  }

  get signalInvitationToken(): string | undefined {
    return this._signalInvitationToken;
  }
  set signalInvitationToken(value: string) {
    // this.compressString(value);
    // this.decompressString(value);
    this._signalInvitationToken = value;
  }

  get signalInvitationTokenCreated(): boolean {
    return this._signalInvitationTokenCreated;
  }
  set signalInvitationTokenCreated(value: boolean) {
    this._signalInvitationTokenCreated = value;
  }

  get playerName(): string {
    return this._playerName;
  }
  set playerName(value: string) {
    this._playerName = value;
  }


  createOrJoinPlayground(optionSelected: number): void {
    if (this.playerName.trim().length > 0) {
      this.createPlayground = Boolean(optionSelected);
      // if (this.optionSelected === PlaygroundEnum.CREATE) {
      this._webRtc.initiateWebRtc(this.playerName);
      // } else {
      // }

      // this.nextStage = true;
      // this.showDialog();
      // this.showPlaygroundDialog = false;
      // this.showTokenDialog = true;
    } else {
      // NOTE - Show Toaster
    }

    // navigator.permissions.query({ name: 'clipboard-write' as PermissionName }).then((result) => {
    //   if (result.state === "granted" || result.state === "prompt") {
    //     /* write to the clipboard now */
    //     this.callMeMaybe();
    //   }
    // });

  }

  resetTokenForPlayground(): void {
    this.signalInvitationToken = '';
  }

  sendTokenForPlayground(): void {
    if (this.signalInvitationToken?.trim().length) {
      // this._webRtc.sendMessageWebRtc(this._webRtc.signalInvitationToken);
      this._webRtc.sendMessageWebRtc();
      // this.showTokenDialog = false;
    } else {
      // NOTE - Show Toaster
    }
  }

  async copyToClipboard() {
    // navigator.permissions.query({ name: 'clipboard-write' as PermissionName }).then(async (result) => {
    //   if (result.state === "granted" || result.state === "prompt") {
    //     /* write to the clipboard now */
    //     await parent.navigator.clipboard.writeText('Bhai Bhai' ?? '');
    //   }
    // });

    await navigator.clipboard.writeText(this.signalInvitationToken ?? '')
    console.log('Clicked!!!');
  }


  // static get playgroundMap(): Map<number, GameMetadata> {
  //   return PlaygroundService._playgroundMap;
  // }

  // get opponent$(): Observable<any> {
  //   return this._opponent.asObservable();
  // }

  // get player$(): Observable<any> {
  //   return this._player.asObservable();
  // }

  // get webRtcModel(): WebRtcModel {
  //   return this._webRtc;
  // }

  // get token(): boolean {
  //   return this.webRtcModel.signalInvitationTokenCreated;
  // }

  // public sendMessageToOpponent(message: any): void {
  //   this._opponent.next(message);
  // }

  // public sendMessageToPlayer(message: any): void {
  //   this._player.next(message);
  // }

  // joinExistingPlayground(playerName: string): void {
  //   this.webRtcModel.initiateWebRtc(playerName);
  // }

  // createNewPlayground(playerName: string): void {
  //   // this._playgroundCounter = 0;
  //   // if (PlaygroundService._playgroundMap.size > 0) {
  //   //   this.createPlayground(playerName); // Incorrect Logic, If the Playground already exists, don't create new, if not create new.
  //   // } else {
  //   //   this.addToPlaygroundMap(playerName);
  //   // }
  //   // this.initiateWebRtcConnection(playerName);
  //   this.webRtcModel.initiateWebRtc(playerName);
  // }

  // // sendTokenForPlayground(token: string): void {
  // //   this.webRtcModel.sendSignalWebRtc(token);
  // // }

  // // initiateWebRtcConnection(playerName: string): void {
  // //   // this._webRtc.createPlayground = true;
  // //   // this._webRtc.playerName = playerName;
  // //   // this._webRtc.initiateWebRtc(playerName);

  // //   this.webRtcModel.initiateWebRtc(playerName);
  // // }

  // terminateWebRtcConnection(): void {
  //   // this._webRtc.terminateWebRtc();
  //   this.webRtcModel.terminateWebRtc();
  // }

  // // sendWebRtcMessages(message: string): void {
  // //   this.webRtcModel.sendMessageWebRtc(message);
  // // }



  // private createPlayground(playerName: string): void {
  //   do {
  //     if (PlaygroundService._playgroundMap.has(this._playgroundCounter)) {
  //       this._playgroundCounter++;
  //     } else {
  //       this.addToPlaygroundMap(playerName);
  //       break;
  //     }
  //   } while(this._playgroundCounter)
  // }

  // private addToPlaygroundMap(playerName: string): void {
  //   const playgroundMetadata: PlayGroundMetadata = {
  //     player1Name: playerName,
  //     player1Exists: true,
  //     player2Name: '',
  //     player2Exists: false,
  //     playgroundId: this._playgroundCounter
  //   };

  //   // Notify Player 1 with the updated PlaygroundMetadata on subscription in the 'playground' component.
  //   const playgroundSubject: BehaviorSubject<PlayGroundMetadata> = new BehaviorSubject<PlayGroundMetadata>(playgroundMetadata);
  //   // playgroundSubject.next()
  //   PlaygroundService._playgroundMap.set(this._playgroundCounter, { playgroundSubject: playgroundSubject, playgroundMetadata: playgroundMetadata })
  //   // this.router.navigate(['playground'], { state: { playgroundMetadata: playgroundMetadata } });
  //   this.router.navigate(['playground'], { state: { playgroundId: this._playgroundCounter } });
  // }




  // createOrJoinPlayground(): void {
  //     this._webRtc.initiateWebRtc(this._webRtc.playerName);

  // }

  // sendTokenForPlayground(): void {
  //   if (this.webRtcModel.signalInvitationToken?.trim().length) {
  //     // this.webRtcModel.sendMessageWebRtc(this.webRtcModel.signalInvitationToken);
  //     // this.showTokenDialog = false;
  //   } else {
  //     // NOTE - Show Toaster
  //   }
  // }

}

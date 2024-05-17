// export class WebRtcModel {
// import * as wrtc from './../../../../node_modules/electron-webrtc/browser';
// const wrtc = require('./../../../../node_modules/electron-webrtc/index')
import { NgZone } from '@angular/core';
import { compress, decompress } from '@zalari/string-compression-utils';
import SimplePeer from 'simple-peer';

import { PlaygroundGameStage, PlaygroundGameTossStage } from '../../enums/playground.enum';
import { PlaygroundService } from '../../services/playground.service';
import { GameMidSegwayMetadata } from '../../types/app-types';



//   // // Set up an asynchronous communication channel that will be
//   // // used during the peer connection setup
//   // private _signalingChannel: any;
//   // private readonly _configuration = { 'iceServers' : [{ 'urls': 'stun:stun.l.google.com:19302' }] };

//   // // PC1
//   // async makeCall()  {
//   //   const peerConnection = new RTCPeerConnection(this._configuration);
//   //   this._signalingChannel.addEventListener('message', async message => {
//   //       if (message.answer) {
//   //           const remoteDesc = new RTCSessionDescription(message.answer);
//   //           await peerConnection.setRemoteDescription(remoteDesc);
//   //       }
//   //   });
//   //   const offer = await peerConnection.createOffer();
//   //   await peerConnection.setLocalDescription(offer);
//   //   this._signalingChannel.send({'offer': offer});
//   // }

//   private _createPlayground?: boolean;

//   private _signaling: BroadcastChannel;
//   // private _receiver: BroadcastChannel;
//   // private peerConnection: any;
//   private _isReady: boolean = false;

//   private _localConnection?: RTCPeerConnection;
//   private _remoteConnection?: RTCPeerConnection;
//   private _chatChannel: any;
//   private _sendChannel: any = null;
//   private _receiveChannel: any;

//   playerName: string = '';

//   cfg = {'iceServers': [{urls: 'stun:23.21.150.121'}]};
//   con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };

//   constructor() {
//     // NOTE - This is where it begins!
//     this._signaling = new BroadcastChannel('webrtc');
//     // this._receiver = new BroadcastChannel('webrtc');
//     this.handleSignalingEvents();
//   }

//   get createPlayground(): boolean {
//     return !!this._createPlayground;
//   }
//   set createPlayground(value: boolean) {
//     this._createPlayground = value;
//   }

//   get peerConnection() {
//     return this.createPlayground ? this._localConnection : this._remoteConnection;
//   }
//   set peerConnection(value: any) {
//     // this.peerConnection = value;
//     this.createPlayground ? this._localConnection = value : this._remoteConnection = value;
//   }

//   get isReady(): boolean {
//     return this._isReady;
//   }
//   set isReady(value: boolean) {
//     this._isReady = value;
//   }

//   // private peerConnection(peer: any) {
//   //   return (peer === this._localConnection) ? this._localConnection : this._remoteConnection;
//   // }

//   private handleSignalingEvents(): void {
//     this._signaling.onmessage = e => {
//     // this._receiver.onmessage = e => {
//       if (!this._isReady) {
//         console.log('yeah not ready yet');
//         return;
//       }
//       switch (e.data.type) {
//         case 'offer':
//           this.handleOffer(e.data);
//           break;
//         case 'answer':
//           this.handleAnswer(e.data);
//           break;
//         case 'candidate':
//           this.handleCandidate(e.data);
//           break;
//         case 'ready':
//           // A second tab joined. This tab will initiate a call unless in a call already.
//           if (this.peerConnection) {
//             console.log('already in call, ignoring');
//             return;
//           }
//           this.makeCall();
//           break;
//         case 'bye':
//           if (this.peerConnection) {
//             this.hangup();
//           }
//           break;
//         // case 'message':
//         //   break;
//         default:
//           console.log('unhandled', e);
//           break;
//       }
//     };

//     this._signaling.onmessageerror = err => {
//       console.log('err: ', err);
//     }
//   }

//   async hangup() {
//     if (this.peerConnection) {
//       this.peerConnection.close();
//       this.peerConnection = null;
//     }

//     this._isReady = false;

//     // this._localStream.getTracks().forEach((track: any) => track.stop());
//     // this._localStream = null;
//     // startButton.disabled = false;
//     // hangupButton.disabled = true;
//   };

//   createPeerConnection() {
//     this._localConnection = new RTCPeerConnection(this.cfg);
//     this._remoteConnection = new RTCPeerConnection(this.cfg);

//     this.peerConnection.oniceconnectionstatechange = (e: any) => console.log(this.peerConnection.iceConnectionState);

//     // if (this.createPlayground) {
//     //   this._sendChannel = this.peerConnection.createDataChannel('sendDataChannel');
//     // }

//     this.peerConnection.onicecandidate = (e: any) => {
//       const message: any = {
//         type: 'candidate',
//         candidate: null,
//       };
//       if (e.candidate) {
//         message.candidate = e.candidate.candidate;
//         message.sdpMid = e.candidate.sdpMid;
//         message.sdpMLineIndex = e.candidate.sdpMLineIndex;
//       }
//       this._signaling.postMessage(message);
//     };
//     // pc.ontrack = e => remoteVideo.srcObject = e.streams[0];
//     // localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
//   }

//   async createDataChannel() {
//     // if (!!this._createPlayground) {
//       this._chatChannel = this.peerConnection.createDataChannel('chatChannel');
//       this.handleMessagesOnChatChannel(this._chatChannel);
//     // }
//   }

//   async handleDataChannel() {
//     // if (!this._createPlayground) {
//     this.peerConnection.ondatachannel = (e: any) => {
//       if (e.channel.label === 'chatChannel') {
//         console.log('chatChannel Received: ', e);
//         this._chatChannel = e.channel;
//         this.handleMessagesOnChatChannel(this._chatChannel);
//         this.sendMessageOnChatChannel(e.channel);
//       }
//     }
//     // }
//   }

//   async makeCall() {
//     await this.createPeerConnection();
//     await this.createDataChannel();

//     await this.handleDataChannel();

//     const offer = await this.peerConnection.createOffer();
//     this._signaling.postMessage({type: 'offer', sdp: offer.sdp});
//     await this.peerConnection.setLocalDescription(offer);
//   }

//   async handleOffer(offer: any) {
//     if (this.peerConnection) {
//       console.error('existing peer connection');
//       return;
//     }
//     await this.createPeerConnection();
//     await this.handleDataChannel();
//     await this.peerConnection.setRemoteDescription(offer);

//     const answer = await this.peerConnection.createAnswer();
//     this._signaling.postMessage({type: 'answer', sdp: answer.sdp});
//     await this.peerConnection.setLocalDescription(answer);
//   }

//   async handleAnswer(answer: any) {
//     if (!this.peerConnection) {
//       console.error('no peer connection');
//       return;
//     }
//     await this.peerConnection.setRemoteDescription(answer);
//   }

//   async handleCandidate(candidate: any) {
//     if (!this.peerConnection) {
//       console.error('no peer connection');
//       return;
//     }
//     if (!candidate.candidate) {
//       // await this.peerConnection.addIceCandidate(null);
//     } else {
//       await this.peerConnection.addIceCandidate(candidate);
//     }
//   }

//   async handleMessagesOnChatChannel(event: any) {
//     // this._chatChannel.onopen = this.onSendChannelStateChange;
//     this._chatChannel.onopen = (e: any) => {
//       const readyState = this._chatChannel.readyState;
//       console.log(`Receive channel state is: ${readyState}`);
//       console.log('Chat channel is now open!', e);
//     }
//     this._chatChannel.onmessage = (e: any) => {
//         // chat.innerHTML = chat.innerHTML + "<pre>" + e.data + "</pre>"
//         console.log(`${this.playerName} says: `, e.data)
//     }
//     this._chatChannel.onclose = () => {
//         console.log('Chat channel closed...!');
//     }
//   }

//   onSendChannelStateChange() {
//     const readyState = this._chatChannel.readyState;
//     console.log('Send channel state is: ' + readyState);
//     // if (readyState === 'open') {
//     //   dataChannelSend.disabled = false;
//     //   dataChannelSend.focus();
//     //   sendButton.disabled = false;
//     //   closeButton.disabled = false;
//     // } else {
//     //   dataChannelSend.disabled = true;
//     //   sendButton.disabled = true;
//     //   closeButton.disabled = true;
//     // }
//   }

//   public initiateWebRtc(playerName: string): void {
//     this._isReady = true;
//     this._createPlayground = playerName === 'Player 1';
//     this.playerName = playerName;

//     this._signaling.postMessage({type: 'ready'});
//   }

//   public terminateWebRtc(): void {
//     this._signaling.postMessage({type: 'bye'});
//   }

//   public sendMessageOnChatChannel(message: string): void {
//     this._chatChannel.send(message);
//   }

// }

// var SimplePeer = require('simple-peer')

// const SimplePeer = require('../../../../node_modules/simple-peer/simplepeer.min.js');
// const wrtc = require('../../../../node_modules/electron-webrtc/index.js')({ headless: true });

// let Quassel = window['require']('electron-webrtc');

export class WebRtcModel {


  cfg = {'iceServers': [{urls: 'stun:23.21.150.121'}]};
  con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };

  constructor(private _playgroundService: PlaygroundService, private _ngZone: NgZone) {
    // NOTE - This is where it begins!
    // this._signaling = new BroadcastChannel('webrtc');playerName: string = '';
    // this._receiver = new BroadcastChannel('webrtc');
    // this.handleSignalingEvents();
  }


  // private peerConnection(peer: any) {
  //   return (peer === this._localConnection) ? this._localConnection : this._remoteConnection;
  // }

  private async compressString(inputString: string): Promise<void> {
    await compress(inputString, 'gzip').then((data: string) => {
      // this._compressedString = data;
      this._playgroundService.signalInvitationToken = data;
      this._playgroundService.signalInvitationTokenCreated = true;
      console.log('compressedString: ', this._playgroundService.signalInvitationToken);
    });;
    // const urlFriendly = encodeURIComponent(compressedString);

    console.log('compressedString: ', this._playgroundService.signalInvitationToken);
    // console.log('urlFriendly: ', urlFriendly);
  }

  private async decompressString(compressedString: string): Promise<void> {
    // const decodedString = decodeURIComponent(urlFriendly);
    await decompress(compressedString, 'gzip').then((data: string) => {
      this._playgroundService.signalInvitationToken = data;
      console.log('output: ', this._playgroundService.signalInvitationToken);
      this._playgroundService.peerConnection.signal(JSON.parse(this._playgroundService.signalInvitationToken ?? ''));
    });

    // console.log('decodedString: ', decodedString);
    console.log('output: ', this._playgroundService.signalInvitationToken);
  }

  private handleSignalingEvents(): void {
    // this.peerConnection = new SimplePeer({
    //   initiator: this.createPlayground,
    //   // wrtc: wrtc,
    //   trickle: false
    // });
    // console.log('Simple Peer: ', this.peerConnection);

    this._playgroundService.peerConnection.on('signal', (data: any) => {
      if (data.type !== 'candidate') {
        // this.signalInvitationToken = JSON.stringify(data);
        // this.signalInvitationTokenCreated = true;
        this.compressString(JSON.stringify(data));
      }
      console.log('SIGNAL: ', JSON.stringify(data));
    });

    this._playgroundService.peerConnection.on('error', (err: any) => {
      this._playgroundService.isConnecting = false;
      this._playgroundService.isConnected = false;
      console.error('ERROR: ', err);
      this._playgroundService.messageService.add({ severity: 'error', summary: 'Error', detail: 'Connection Unsuccessful' });
    });

    this._playgroundService.peerConnection.on('close', () => {
      console.log('CLOSED!');
    });

    this._playgroundService.peerConnection.on('connect', () => {
      this._ngZone.run(() => {
        {
          this._playgroundService.isConnecting = false;
          this._playgroundService.isConnected = true;
          this._playgroundService.messageService.add({ severity: 'success', summary: 'Success', detail: 'Connected Successfully!!' });
        }
      });
      console.log('CONNECTED!');
      this._playgroundService.peerConnection.send(JSON.stringify(`Ohayo Sekai! Good Morning World!! x ${(Math.floor(Math.random() * 2) + 10)} - ${this._playgroundService.playerName}`));
    });

    this._playgroundService.peerConnection.on('data', (data: any) => {
      let message = new TextDecoder("utf-8").decode(data);
      this._playgroundService.ngZone.run(() => {
        this.handleMessages(message);
      })
    });
  }

  private handleMessages(message: string): void {
    const parsedData: { gameStage: PlaygroundGameStage, message: string } = JSON.parse(message);
    if (parsedData?.gameStage !== undefined && parsedData?.message !== undefined) {
      switch(parsedData.gameStage) {
        case PlaygroundGameStage.RULES: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.RULES, message: '', messageFrom: 'subject' } as GameMidSegwayMetadata);
          break;
        }
        case PlaygroundGameStage.TOSS: {
          // const tossResult = Boolean(+parsedData.message);
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.TOSS, message: parsedData.message, tossMessage: +parsedData.message, messageFrom: 'subject' } as GameMidSegwayMetadata);
          // NOTE - Commented for now, but this code works!
          // this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStage.TOSS, message: PlaygroundGameTossStage.PHASE_0, messageFrom: 'subject' } as GameMidSegwayMetadata);
          this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStage.TOSS, message: PlaygroundGameTossStage.PHASE_1, messageFrom: 'subject' } as GameMidSegwayMetadata);
          // NOTE - Commented for now, but this code works! (if block only)
          // if (!this._playgroundService.createPlayground) {
          //   this.sendMessageWebRtc(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: tossResult, messageFrom: 'peer' } as GameMidSegwayMetadata))
          // }
          // this._playgroundService.tossCompleted.complete();
          break;
        }

        case PlaygroundGameStage.SHUFFLE: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.SHUFFLE, message: PlaygroundGameStage.SHUFFLE, beginShuffle: true, messageFrom: 'subject' } as GameMidSegwayMetadata);
          break;
        }

        case PlaygroundGameStage.DISTRIBUTE: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.DISTRIBUTE, message: message, messageFrom: 'subject' } as GameMidSegwayMetadata);
          break;
        }

        default: {
          break;
        }
      }
    } else {
      console.log('DATA: ', message);
    }
  }

  public initiateWebRtc(): void {
    // this._playgroundService.createPlayground = playerName === 'Player 1';
    // this._playgroundService.playerName = playerName;

    this._playgroundService.peerConnection = new SimplePeer({
      initiator: this._playgroundService.createPlayground,
      // NOTE: (Critical)
      // In order to fix the UI issue where the next screen is stepper was not working in case of 'Join' workflow,
      // i.e. the UI was stuck on the message - 'Connecting to the a Playground... Please Wait!' because the code flow wasn't coming out of the 'peerConnection's on signal event handler' apparently.
      // Do not know why, but apparently, sending signal once out of that event handler was not enough, but by setting trickle = true in case of 'Join Playground' workflow, multiple signals are thrown,
      // which somehow is triggering the UI's change detection cycle. I know it's a hack (jugad) but I do not have the time or luxury to analyze this any further, so if it works, it works! 😉
      trickle: !this._playgroundService.createPlayground
    });
    console.log('Simple Peer: ', this._playgroundService.peerConnection);

    this.handleSignalingEvents();

    // if(this._createPlayground) {
    //   this.peerConnection.signal(token);
    // }

    // this._signaling.postMessage({type: 'ready'});
  }

  public terminateWebRtc(): void {
    // this._signaling.postMessage({type: 'bye'});
  }

  // public sendSignalWebRtc(token: string) {
  //   this.peerConnection.signal(token);
  // }

  public sendSignalWebRtc(): void {
    // this._chatChannel.send(message);
    this.decompressString(this._playgroundService.signalInvitationToken ?? '');
    // this.peerConnection.signal(JSON.parse(this.signalInvitationToken ?? ''));
  }

  public sendMessageWebRtc(message: string): void {
    this._playgroundService.peerConnection.send(message);
  }
}

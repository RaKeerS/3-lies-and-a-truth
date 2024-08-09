import { NgZone } from '@angular/core';
import { compress, decompress } from '@zalari/string-compression-utils';
import { error } from 'console';
import Peer, { DataConnection, PeerError } from 'peerjs';
import SimplePeer from 'simple-peer';

import { PlaygroundGameStageEnum, PlaygroundGameStagePhaseEnum } from '../../enums/playground.enum';
import { PlaygroundService } from '../../services/playground.service';
import { GameMidSegueMetadata } from '../../types/app-types';

export class WebRtcModel {

  private _lastPeerId?: string;
  private _connection?: DataConnection;
  private _disconnect?: boolean = false;

  cfg = {'iceServers': [{urls: 'stun:23.21.150.121'}]};
  con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };

  custCfg = {
    iceServers: [
      // {
      //   urls: 'stun:stun.l.google.com:19302'
      // },
      // {
      //   urls: 'turn:192.158.29.39:3478?transport=udp',
      //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      //   username: '28224511:1379330808'
      // },
      // {
      //   urls: 'turn:192.158.29.39:3478?transport=tcp',
      //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      //   username: '28224511:1379330808'
      // }
      // { urls: 'turn:freestun.net:5350', username: 'free', credential: 'free' },


      // {
      //   urls: "stun:openrelay.metered.ca:80",
      // },
      // {
      //   urls: "turn:openrelay.metered.ca:80",
      //   username: "openrelayproject",
      //   credential: "openrelayproject",
      // },
      // {
      //   urls: "turn:openrelay.metered.ca:443",
      //   username: "openrelayproject",
      //   credential: "openrelayproject",
      // },
      // {
      //   urls: "turn:openrelay.metered.ca:443?transport=tcp",
      //   username: "openrelayproject",
      //   credential: "openrelayproject",
      // },
    ] as RTCIceServer[]
  }

  // NOTE: Working List of IceServers!
  // const peer = new SimplePeer({
  //   initiator: true,
  //   objectMode: true,
  //   config: {
  //     iceServers: [
  //       {
  //         url: 'turn:numb.viagenie.ca',
  //         credential: 'muazkh',
  //         username: 'webrtc@live.com'
  //       },
  //       {
  //         url: 'turn:192.158.29.39:3478?transport=udp',
  //         credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //         username: '28224511:1379330808'
  //       },
  //       {
  //         url: 'turn:192.158.29.39:3478?transport=tcp',
  //         credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //         username: '28224511:1379330808'
  //       },
  //       {
  //         url: 'turn:turn.bistri.com:80',
  //         credential: 'homeo',
  //         username: 'homeo'
  //       },
  //       {
  //         url: 'turn:turn.anyfirewall.com:443?transport=tcp',
  //         credential: 'webrtc',
  //         username: 'webrtc'
  //       }
  //     ]
  //   }
  // })

  // private _iceServers = [
  //   {
  //     urls: "stun:openrelay.metered.ca:80",
  //   },
  //   {
  //     urls: "turn:openrelay.metered.ca:80",
  //     username: "openrelayproject",
  //     credential: "openrelayproject",
  //   },
  //   {
  //     urls: "turn:openrelay.metered.ca:443",
  //     username: "openrelayproject",
  //     credential: "openrelayproject",
  //   },
  //   {
  //     urls: "turn:openrelay.metered.ca:443?transport=tcp",
  //     username: "openrelayproject",
  //     credential: "openrelayproject",
  //   },
  // ]

  // NOTE: Not working List of IceServers!
  private _iceServers = [
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "c483cc3551a5809d406b7f30",
      credential: "1PmhzrBoIJXH/N4i",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "c483cc3551a5809d406b7f30",
      credential: "1PmhzrBoIJXH/N4i",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "c483cc3551a5809d406b7f30",
      credential: "1PmhzrBoIJXH/N4i",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "c483cc3551a5809d406b7f30",
      credential: "1PmhzrBoIJXH/N4i",
    },
  ];

  // private _iceServers = [
  //   {
  //     urls: 'turn:numb.viagenie.ca',
  //     credential: 'muazkh',
  //     username: 'webrtc@live.com'
  //   },
  //   {
  //     urls: 'turn:192.158.29.39:3478?transport=udp',
  //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //     username: '28224511:1379330808'
  //   },
  //   {
  //     urls: 'turn:192.158.29.39:3478?transport=tcp',
  //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //     username: '28224511:1379330808'
  //   },
  //   {
  //     urls: 'turn:turn.bistri.com:80',
  //     credential: 'homeo',
  //     username: 'homeo'
  //   },
  //   {
  //     urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
  //     credential: 'webrtc',
  //     username: 'webrtc'
  //   }
  // ];

  constructor(private _playgroundService: PlaygroundService, private _ngZone: NgZone) {
    // NOTE - This is where it begins!
    // this._signaling = new BroadcastChannel('webrtc');playerName: string = '';
    // this._receiver = new BroadcastChannel('webrtc');
    // this.handleSignalingEvents();

    // this._iceServers = this.fetchTurnServerCredentials();
    // this.fetchTurnServerCredentials();
  }

  get isWebRtcSupported(): boolean {
    return SimplePeer.WEBRTC_SUPPORT;
  }

  private async fetchTurnServerCredentials(): Promise<void> {
    // Calling the REST API TO fetch the TURN Server Credentials
    const response = await fetch("https://webrtc-development-app.metered.live/api/v1/turn/credentials?apiKey=882b79b4ec7814a772c3189d5f335c691024");

    // Saving the response in the iceServers array
    const iceServers = await response.json();
    // return await response.json();

    // Using the iceServers array in the RTCPeerConnection method
    // var myPeerConnection = new RTCPeerConnection({
    //   iceServers: iceServers
    // });

    this._iceServers = iceServers;
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

  private handlePeerEvents(peer: Peer): void {
    peer.on('open', (id: string) => {
      if (!peer.id) {
        console.log('Received null id from peer open', 'id: ', id);
      } else {
        if (this._playgroundService.createPlayground) {
          this._lastPeerId = this._playgroundService.signalInvitationToken = peer.id;
          this._playgroundService.signalInvitationTokenCreated = true;
        }
      }

      console.log('peer.id: ', id);
    });

    peer.on('connection', (connection: DataConnection) => {
      if (this._playgroundService.createPlayground) {
        // Allow only a single connection
        if (this._connection && this._connection.open) {
          connection.on('open', () => {
            connection.send('Already connected to another Client!');
            connection.close();
          });
          return;
        }

        this._connection = connection;
        // console.log('Connected to: ', connection.peer);

        this.handleConnectionEvents();
      } else {
        connection.on('open', () => {
          connection.send('Joiner does not accept incoming connections!');
          connection.close();
        });
      }
    });

    peer.on('disconnected', () => {
      console.log('Connection lost. Please reconnect!');

      // Workaround for peer.reconnect deleting previous id
      // peer.id = this._lastPeerId;
      // peer.ser = this._lastPeerId;
      if (!this._disconnect) {
        console.log('Retrying connection!');
        this._playgroundService.messageService.add({ severity: 'info', summary: 'Information', detail: 'Reconnecting... Please wait!' });
        peer.reconnect();
      }
    });

    peer.on('close', () => {
      this._connection = undefined;
      console.log('Connection destroyed, Connection closed!');
    });

    peer.on('error', (error: PeerError<"disconnected" | "browser-incompatible" | "invalid-id" | "invalid-key" | "network" | "peer-unavailable" | "ssl-unavailable" | "server-error" | "socket-error" | "socket-closed" | "unavailable-id" | "webrtc">) => {
      this._playgroundService.isConnecting = false;
      this._playgroundService.isConnected = false;
      this._playgroundService.messageService.add({ severity: 'error', summary: 'Error', detail: 'Connection Unsuccessful' });
      console.log('Error: ', error);
      alert('' + error);
    });
  }

  private handleConnectionEvents(): void {
    this._connection?.on('open', () => {
      this._playgroundService.isConnecting = false;
      this._playgroundService.isConnected = true;
      this._playgroundService.messageService.add({ severity: 'success', summary: 'Success', detail: 'Connected Successfully!!' });

      console.log("Connected to: " + this._connection?.peer);
    });

    this._connection?.on('data', (data) => {
      console.log('Data received: ', data);
      console.log('Peer: ', this._connection?.peer);

      if (data) {
        this.handleMessages(data.toString());
      }
    });

    this._connection?.on('close', () => {
      console.log('Data Connection closed for :', this._connection?.peer);
      this._connection = undefined;
    });
  }

  private handleMessages(message: string): void {
    // const parsedData: { gameStage: PlaygroundGameStage, message: string } = JSON.parse(message);
    const parsedData: GameMidSegueMetadata = JSON.parse(message);
    if (parsedData?.gameStage !== undefined && parsedData?.message !== undefined) {
      switch(parsedData.gameStage) {
        case PlaygroundGameStageEnum.OTHER: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.OTHER, message: parsedData.message, gameStagePhase: parsedData.gameStagePhase, messageFrom: 'subject' } as GameMidSegueMetadata);
          break;
        }

        case PlaygroundGameStageEnum.RULES: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.RULES, message: PlaygroundGameStageEnum.RULES, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, messageFrom: 'subject' } as GameMidSegueMetadata);
          break;
        }

        case PlaygroundGameStageEnum.TOSS: {
          // const tossResult = Boolean(+parsedData.message);
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: parsedData.message, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, tossMessage: +parsedData.message, messageFrom: 'subject' } as GameMidSegueMetadata);
          // NOTE - Commented for now, but this code works!
          // this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStage.TOSS, message: PlaygroundGameTossStage.PHASE_0, messageFrom: 'subject' } as GameMidSegwayMetadata);
          this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: PlaygroundGameStagePhaseEnum.COMPLETED, messageFrom: 'subject' } as GameMidSegueMetadata);
          // NOTE - Commented for now, but this code works! (if block only)
          // if (!this._playgroundService.createPlayground) {
          //   this.sendMessageWebRtc(JSON.stringify({ gameStage: PlaygroundGameStage.TOSS, message: tossResult, messageFrom: 'peer' } as GameMidSegwayMetadata))
          // }
          // this._playgroundService.tossCompleted.complete();
          break;
        }

        case PlaygroundGameStageEnum.BET: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.BET, message: parsedData.message, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, betAmount: +parsedData.message, messageFrom: 'subject' } as GameMidSegueMetadata);
          break;
        }

        case PlaygroundGameStageEnum.SHUFFLE: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.SHUFFLE, message: PlaygroundGameStageEnum.SHUFFLE, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, beginShuffle: true, messageFrom: 'subject' } as GameMidSegueMetadata);
          break;
        }

        case PlaygroundGameStageEnum.DISTRIBUTE: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.DISTRIBUTE, message: parsedData.message, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, messageFrom: 'subject' } as GameMidSegueMetadata);
          break;
        }

        case PlaygroundGameStageEnum.PICK: {
          // switch (parsedData.gameStagePhase) {
          //   case PlaygroundGameStagePhase.INITIAL: {
          //     this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.CHOOSE, message: parsedData.message, gameStagePhase: PlaygroundGameStagePhase.INITIAL, messageFrom: 'subject' } as GameMidSegwayMetadata);
          //     break;
          //   }

          //   case PlaygroundGameStagePhase.INTERMEDIATE: {
          //     // this._playgroundService.switch.next({ gameStage: PlaygroundGameStage.PICK, message: parsedData.message, gameStagePhase: PlaygroundGameStagePhase.INTERMEDIATE, messageFrom: 'subject' } as GameMidSegwayMetadata);
          //     break;
          //   }
          // }
          break;
        }

        // NOTE: The Player in Pick Mode would send Choose to partner with Initial, then on Submitting choices via. Submit button will again send Choose to partner but with Intermediate gamephase.
        case PlaygroundGameStageEnum.CHOOSE: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.CHOOSE, message: parsedData.message, gameStagePhase: parsedData.gameStagePhase, messageFrom: 'subject' } as GameMidSegueMetadata);
          break;
        }

        case PlaygroundGameStageEnum.EVALUATE: {
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.EVALUATE, message: parsedData.message, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, isPicker: parsedData.isPicker, messageFrom: 'peer' } as GameMidSegueMetadata);
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
      // which somehow is triggering the UI's change detection cycle. I know it's a hack (jugaad) but I do not have the time or luxury to analyze this any further, so if it works, it works! 😉
      trickle: false,
      iceCompleteTimeout: 100,
      config: {
        // iceServers: this.custCfg.iceServers
        iceServers: this._iceServers,
        iceTransportPolicy: 'relay'
      }
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
    this._playgroundService.peerConnection.destroy();
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

  public initiatePeerConnection(): void {
    this._playgroundService.peerConnection = new Peer('', { debug: 0 });

    this.handlePeerEvents(this._playgroundService.peerConnection);
  }

  public terminatePeerConnection(): void {
    this._disconnect = true;
    this.terminateDataConnection();
    this._playgroundService.peerConnection.disconnect();
    this._playgroundService.peerConnection.destroy();
  }

  private terminateDataConnection(): void {
    this._connection?.close();
  }

  public sendMessageViaDataConnection(message: string): void {
    this._connection?.send(message);
  }

  public joinAnInitiator(): void {
    if (this._connection) {
      this._connection.close();
    }

    // Create connection to destination peer specified in the input field
    this._connection = this._playgroundService.peerConnection.connect(this._playgroundService.signalInvitationToken, { reliable: true })

    // console.log('Connected to Peer: ', this._connection?.peer);
    this.handleConnectionEvents();
  }
}

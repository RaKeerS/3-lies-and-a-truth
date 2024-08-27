import { NgZone } from '@angular/core';
import { error } from 'console';
import Peer, { DataConnection, PeerError } from 'peerjs';

import { PlaygroundGameStageEnum, PlaygroundGameStagePhaseEnum } from '../../enums/playground.enum';
import { PlaygroundService } from '../../services/playground.service';
import { GameMidSegueMetadata } from '../../types/app-types';

export class WebRtcModel {

  private _lastPeerId?: string;
  private _connection?: DataConnection;
  private _disconnect?: boolean = false;

  constructor(private _playgroundService: PlaygroundService, private _ngZone: NgZone) {
    // NOTE - This is where it begins!
  }

  private handlePeerEvents(peer: Peer): void {
    peer.on('open', (id: string) => {
      if (!peer.id) {
        // console.log('Received null id from peer open', 'id: ', id);
      } else {
        if (this._playgroundService.createPlayground) {
          this._lastPeerId = this._playgroundService.signalInvitationToken = peer.id;
          this._playgroundService.signalInvitationTokenCreated = true;
        }
      }

      // console.log('peer.id: ', id);
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
      // console.log('Connection lost. Please reconnect!');

      if (!this._disconnect) {
        console.log('Retrying connection!');
        this._playgroundService.messageService.add({ severity: 'info', summary: 'Information', detail: 'Reconnecting... Please wait!' });
        peer.reconnect();
      }
    });

    peer.on('close', () => {
      this._connection = undefined;
      this._playgroundService.isConnecting = false;
      this._playgroundService.isConnected = false;
      // console.log('Connection destroyed, Connection closed!');
    });

    peer.on('error', (error: PeerError<"disconnected" | "browser-incompatible" | "invalid-id" | "invalid-key" | "network" | "peer-unavailable" | "ssl-unavailable" | "server-error" | "socket-error" | "socket-closed" | "unavailable-id" | "webrtc">) => {
      this._playgroundService.isConnecting = false;
      this._playgroundService.isConnected = false;
      this._playgroundService.messageService.add({ severity: 'error', summary: 'Error', detail: 'Connection Unsuccessful' });
      // console.log('Error: ', error);
      // alert('' + error);
    });
  }

  private handleConnectionEvents(): void {
    this._connection?.on('open', () => {
      this._playgroundService.isConnecting = false;
      this._playgroundService.isConnected = true;
      this._playgroundService.messageService.add({ severity: 'success', summary: 'Success', detail: 'Connected Successfully!!' });

      // console.log("Connected to: " + this._connection?.peer);
    });

    this._connection?.on('data', (data) => {
      // console.log('Data received: ', data);
      // console.log('Peer: ', this._connection?.peer);

      if (data) {
        this.handleMessages(data.toString());
      }
    });

    this._connection?.on('close', () => {
      // console.log('Data Connection closed for :', this._connection?.peer);
      this._connection = undefined;
    });
  }

  private handleMessages(message: string): void {
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
          this._playgroundService.switch.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: parsedData.message, gameStagePhase: PlaygroundGameStagePhaseEnum.INITIAL, tossMessage: +parsedData.message, messageFrom: 'subject' } as GameMidSegueMetadata);
          this._playgroundService.tossCompleted.next({ gameStage: PlaygroundGameStageEnum.TOSS, message: PlaygroundGameStagePhaseEnum.COMPLETED, messageFrom: 'subject' } as GameMidSegueMetadata);
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
      // console.log('DATA: ', message);
    }
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

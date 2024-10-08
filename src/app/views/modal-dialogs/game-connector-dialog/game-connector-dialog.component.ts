import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { delay, filter, of, Subscription, tap } from 'rxjs';

import { PlaygroundGameEnum, PlaygroundGameStageEnum } from '../../../enums/playground.enum';
import { PrimeNgModule } from '../../../prime-ng/prime-ng.module';
import { PlaygroundService } from '../../../services/playground.service';
import { GameMidSegueMetadata } from '../../../types/app-types';


@Component({
  selector: 'app-game-connector-dialog',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './game-connector-dialog.component.html',
  styleUrl: './game-connector-dialog.component.scss'
})

export class GameConnectorDialogComponent implements OnInit, OnDestroy {
  private _showPlaygroundDialog: boolean = false;
  private _playgroundService: PlaygroundService;

  private _modalClosed = false;

  private _tokenHeaderMessageToDisplay1: string = '';
  private _tokenHeaderMessageToDisplay2: string = '';

  private _signalInvitationTokenCreated: boolean = false;

  private _subscription?: Subscription;

  active: number = 0;
  @Output() showPlaygroundDialogChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Input() showPlaygroundDialog: boolean = false;

  playgroundOptions: any[] = [{ label: 'Create Playground', value: PlaygroundGameEnum.CREATE }, { label: 'Join Playground', value: PlaygroundGameEnum.JOIN }];
  optionSelected: number = 1;

  // tokenHeaderMessageToDisplay1 = this.optionSelected === 1 ? 'Send this Token to whom you wish to Connect with' : 'Paste the Token received from your partner';
  // tokenHeaderMessageToDisplay2 = this.optionSelected === 1 ? 'Paste the Token received from your partner' : 'Send this Token to whom you wish to Connect with';

  constructor(injector: Injector) {
    this._playgroundService = injector.get(PlaygroundService);
    this._subscription = this._playgroundService.switch$.pipe(
      filter((metaData?: GameMidSegueMetadata) => metaData?.gameStage === PlaygroundGameStageEnum.CONNECTION),
      tap(() => this.closeDialog())).subscribe();

    // this._webRtc = new WebRtcModel();
  }
  // get signalInvitationTokenCreated() {
  //   return of(this.webRtcModel.signalInvitationTokenCreated);
  // }
  // set signalInvitationTokenCreated(value: boolean) {
  //   this._signalInvitationTokenCreated = value
  // }

  ngOnInit(): void {
    this.playgroundService.playerName = '';
  }

  ngOnDestroy(): void {
    this.playgroundService.signalInvitationToken = '';
    this._subscription?.unsubscribe();
  }

  get tokenHeaderMessageToDisplay1(): string {
    return this.optionSelected === 1 ? 'Send this Token to the partner you wish to connect with' : 'Paste the Token received from your partner';
  }

  get tokenHeaderMessageToDisplay2(): string {
    return this.optionSelected === 1 ? 'Paste the Token received from your partner' : 'Send this Token to the partner you wish to connect with';
  }

  get showPlaygroundDialog(): boolean {
    return this._showPlaygroundDialog;
  }
  @Input() set showPlaygroundDialog(value: boolean) {
    if (!value && [1].includes(this.active) || this.active === 2 && this.playgroundService.isConnecting) {
      this.confirmCancellation();
    }
    // if (!value && this.active !== 0) {
    //   if (this.active === 3 && this.playgroundService.isConnecting) {
    //     this.confirmCancellation();
    //   } else {
    //     this._showPlaygroundDialog = value;
    //     this.showPlaygroundDialogChange.emit(this.showPlaygroundDialog);
    //   }
    //   this.confirmCancellation();
    // }
    else {
      this._showPlaygroundDialog = value;
      this.showPlaygroundDialogChange.emit(this.showPlaygroundDialog);
      if (this.active === 2 && this.playgroundService.isConnected && this.playgroundService.redirectCounter !== 0) {
        this.playgroundService.redirectToPlayground(true);
      }
    }
  }

  get playgroundService(): PlaygroundService {
    return this._playgroundService;
  }

  get redirectCounter(): number {
    if (this.playgroundService.redirectCounter === 0 && !this._modalClosed) {
      this._modalClosed = true;
      this._subscription = of(this._modalClosed).pipe(
        delay(100),
        tap(() => this.closeDialog())).subscribe(() => this._subscription?.unsubscribe());
    }
    return this.playgroundService.redirectCounter;
  }

  get toolTipForJoinWorkflow(): string | undefined {
    return !this.playgroundService.signalInvitationTokenCreated ?
    'Waiting to be connected to a Playground' : !this.playgroundService.isConnected ?
    'Waiting for the connection to be established': '';
  }

  get disableStateForJoinWorkflow(): boolean {
    return !this.playgroundService.signalInvitationTokenCreated ? true : !this.playgroundService.isConnected ? true : false;
  }


  // private navigateIfNotAutoRedirected(instant: boolean): void {
  //   if (instant) {
  //     if(this.active === 3 && this.playgroundService.isConnected) {
  //       this.playgroundService.redirectToPlayground(true);
  //     }
  //   }
  // }

  private closeDialog(): void {
    this.playgroundService.ngZone.run(() => {
      this._showPlaygroundDialog = false;
      this.showPlaygroundDialogChange.emit(this.showPlaygroundDialog);
    });
  }

  confirmCancellation(): void {
    this.playgroundService.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.playgroundService.messageService.add({ severity: 'error', summary: 'Connection Error', detail: 'Connection not established due to interruption!', life: 3000 });
        this.closeDialog();
      },
      reject: () => {
        return false;
      }
    });
  }

  // get message(): string {
  //   if (this.webRtcModel.message.trim().length > 0) {
  //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Connected Successfully!!' });
  //   }
  //   return '';
  // }

  // createOrJoinPlayground(): void {
  //   if (this._webRtc.playerName.trim().length > 0) {
  //     this._webRtc.createPlayground = Boolean(this.optionSelected);
  //     // if (this.optionSelected === PlaygroundEnum.CREATE) {
  //     this._webRtc.initiateWebRtc(this._webRtc.playerName);
  //     // } else {
  //     // }

  //     // this.nextStage = true;
  //     // this.showDialog();
  //     // this.showPlaygroundDialog = false;
  //     // this.showTokenDialog = true;
  //   } else {
  //     // NOTE - Show Toaster
  //   }

  //   // navigator.permissions.query({ name: 'clipboard-write' as PermissionName }).then((result) => {
  //   //   if (result.state === "granted" || result.state === "prompt") {
  //   //     /* write to the clipboard now */
  //   //     this.callMeMaybe();
  //   //   }
  //   // });

  // }

  // resetTokenForPlayground(): void {
  //   this.webRtcModel.signalInvitationToken = '';
  // }

  // sendTokenForPlayground(): void {
  //   if (this._webRtc.signalInvitationToken?.trim().length) {
  //     // this._webRtc.sendMessageWebRtc(this._webRtc.signalInvitationToken);
  //     this._webRtc.sendMessageWebRtc();
  //     // this.showTokenDialog = false;
  //   } else {
  //     // NOTE - Show Toaster
  //   }
  // }

  // async copyToClipboard() {
  //   // navigator.permissions.query({ name: 'clipboard-write' as PermissionName }).then(async (result) => {
  //   //   if (result.state === "granted" || result.state === "prompt") {
  //   //     /* write to the clipboard now */
  //   //     await parent.navigator.clipboard.writeText('Bhai Bhai' ?? '');
  //   //   }
  //   // });

  //   await navigator.clipboard.writeText(this._webRtc.signalInvitationToken ?? '')
  //   console.log('Clicked!!!');
  // }

}

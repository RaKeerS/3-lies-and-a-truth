import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';
import { PlaygroundService } from '../../services/playground.service';


@Component({
  selector: 'app-game-connector',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './game-connector.component.html',
  styleUrl: './game-connector.component.scss'
})
export class GameConnectorComponent implements OnDestroy {

  private _showPlaygroundDialog: boolean = false;

  private _tokenHeaderMessageToDisplay1: string = '';
  private _tokenHeaderMessageToDisplay2: string = '';

  private _signalInvitationTokenCreated: boolean = false;

  active: number = 0;
  @Output() showPlaygroundDialogChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Input() showPlaygroundDialog: boolean = false;

  playgroundOptions: any[] = [{ label: 'Create Playground', value: 1 }, { label: 'Join Playground', value: 0 }];
  optionSelected: number = 1;

  // tokenHeaderMessageToDisplay1 = this.optionSelected === 1 ? 'Send this Token to whom you wish to Connect with' : 'Paste the Token received from your partner';
  // tokenHeaderMessageToDisplay2 = this.optionSelected === 1 ? 'Paste the Token received from your partner' : 'Send this Token to whom you wish to Connect with';

  constructor(private _playgroundService: PlaygroundService) {
    // this._webRtc = new WebRtcModel();
  }
  // get signalInvitationTokenCreated() {
  //   return of(this.webRtcModel.signalInvitationTokenCreated);
  // }
  // set signalInvitationTokenCreated(value: boolean) {
  //   this._signalInvitationTokenCreated = value
  // }

  ngOnDestroy(): void {
    this.playgroundService.playerName = '';
    this.playgroundService.signalInvitationToken = '';
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
    if (!value && [1,2].includes(this.active) || this.active === 3 && this.playgroundService.isConnecting) {
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
    }
  }

  get playgroundService(): PlaygroundService {
    return this._playgroundService;
  }

  get toolTipForJoinWorkflow(): string | undefined {
    return !this.playgroundService.signalInvitationTokenCreated ?
    'Waiting to be connected to a Playground' : !this.playgroundService.isConnected ?
    'Waiting for the connection to be established': '';
  }

  get disableStateForJoinWorkflow(): boolean {
    return !this.playgroundService.signalInvitationTokenCreated ? true : !this.playgroundService.isConnected ? true : false;
  }

  confirmCancellation(): void {
    this.playgroundService.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.playgroundService.messageService.add({ severity: 'error', summary: 'Connection Error', detail: 'Connection not established due to interruption!', life: 3000 });
        this._showPlaygroundDialog = false;
        this.showPlaygroundDialogChange.emit(this.showPlaygroundDialog);
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

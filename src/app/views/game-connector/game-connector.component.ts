import { Component, EventEmitter, Input, Output } from '@angular/core';

import { WebRtcModel } from '../../models/web-rtc/web-rtc.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';


@Component({
  selector: 'app-game-connector',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './game-connector.component.html',
  styleUrl: './game-connector.component.scss'
})
export class GameConnectorComponent {

  private _webRtc: WebRtcModel;
  private _showPlaygroundDialog: boolean = false;

  active: number = 0;
  @Output() showPlaygroundDialogChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Input() showPlaygroundDialog: boolean = false;

  playgroundOptions: any[] = [{ label: 'Create Playground', value: 1 }, { label: 'Join Playground', value: 0 }];
  optionSelected: number = 1;

  constructor() {
    this._webRtc = new WebRtcModel();
  }

  get showPlaygroundDialog(): boolean {
    return this._showPlaygroundDialog;
  }
  @Input() set showPlaygroundDialog(value: boolean) {
    this._showPlaygroundDialog = value;
    this.showPlaygroundDialogChange.emit(this.showPlaygroundDialog);
  }

  get webRtcModel(): WebRtcModel {
    return this._webRtc;
  }

  createOrJoinPlayground(): void {

    if (this._webRtc.playerName.trim().length > 0) {
      this._webRtc.createPlayground = Boolean(this.optionSelected);
      // if (this.optionSelected === PlaygroundEnum.CREATE) {
      this._webRtc.initiateWebRtc(this._webRtc.playerName);
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

}

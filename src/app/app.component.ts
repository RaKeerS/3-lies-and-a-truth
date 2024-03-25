import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PrimeNgModule } from './prime-ng/prime-ng.module';
import { PlaygroundService } from './services/playground.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PrimeNgModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  title = '3-lies-and-a-truth';
  private _playgroundService: PlaygroundService;

  visible = false;
  showPlaygroundDialog: boolean = false;
  showTokenDialog: boolean = false;
  playerName: string = '';
  playgroundId?: number;
  token: string = '';

  constructor(playgroundService: PlaygroundService) {
    this._playgroundService = playgroundService;
  }

  ngOnDestroy(): void {
    this._playgroundService.terminateWebRtcConnection();
  }

  ngAfterViewInit(): void {

    const richTextDiv = document.getElementById("richTextDiv")!;

    console.log('Here: ', richTextDiv)

    const clipboardItem = new ClipboardItem({
        "text/plain": new Blob(
            [JSON.stringify(richTextDiv.innerText)],
            { type: "text/plain" }
        ),
        "text/html": new Blob(
            [richTextDiv.outerHTML],
            { type: "text/html" }
        ),
    });

    navigator.clipboard.write([clipboardItem]);

  }

  callMeMaybe(): void {

    const promise_text_blob = Promise.resolve(new Blob(['hello'], {type: 'text/plain'}));
    const promise_html_blob = Promise.resolve(new Blob(["<p style='color: red; font-style: oblique;'>Test</p>"], {type: 'text/html'}));
    const item = new ClipboardItem({'text/plain': promise_text_blob, 'text/html': promise_html_blob});

    navigator.clipboard.write([item]);
  }

  showDialog(): void {
    this.visible = !this.visible;
  }

  joinExistingPlayground(): void {
    if (this.playerName.trim().length > 0) {
      this._playgroundService.joinExistingPlayground(this.playerName);
      this.showPlaygroundDialog = false;
      this.showTokenDialog = true;
    }
  }

  createNewPlayground(): void {
    if (this.playerName.trim().length > 0) {
      this._playgroundService.createNewPlayground(this.playerName);
      // this.showDialog();
      this.showPlaygroundDialog = false;
      this.showTokenDialog = true;
    } else {
      // NOTE - Show Toaster
    }

    navigator.permissions.query({ name: 'clipboard-write' as PermissionName }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        /* write to the clipboard now */
        this.callMeMaybe();
      }
    });

  }

  sendTokenForPlayground(): void {
    if (this.token.trim().length > 0) {
      this._playgroundService.sendTokenForPlayground(this.token);
      this.showTokenDialog = false;
    } else {
      // NOTE - Show Toaster
    }
  }

}

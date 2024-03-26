import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { compress, decompress } from '@zalari/string-compression-utils';

import { PrimeNgModule } from './prime-ng/prime-ng.module';
import { PlaygroundService } from './services/playground.service';
import { GameConnectorComponent } from './views/game-connector/game-connector.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, PrimeNgModule, GameConnectorComponent]
})
export class AppComponent implements OnDestroy {
  title = '3-lies-and-a-truth';
  private _playgroundService: PlaygroundService;

  createPlayground: boolean = false;
  nextStage = false;
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

    this.callMeMaybe();

  }

  get playgroundService() {
    return this._playgroundService;
  }

  async callMeMaybe() {

    const promise_text_blob = Promise.resolve(new Blob(['hello'], {type: 'text/plain'}));
    const promise_html_blob = Promise.resolve(new Blob(["<p style='color: red; font-style: oblique;'>Test</p>"], {type: 'text/html'}));
    const item = new ClipboardItem({'text/plain': promise_text_blob, 'text/html': promise_html_blob});

    navigator.clipboard.write([item]);


    let input = '{"id":1,"todo":"Do something nice for someone you care about","completed":true,"userId":26}';
    input = `{"type":"offer","sdp":"v=0\r\no=- 3913709253156054490 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 51165 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 103.171.8.127\r\na=candidate:949478220 1 udp 2113937151 86fa5d59-d2e4-4e5c-aca5-cf79b5cdcfef.local 51165 typ host generation 0 network-cost 999\r\na=candidate:2380096326 1 udp 1677729535 103.171.8.127 51165 typ srflx raddr 0.0.0.0 rport 0 generation 0 network-cost 999\r\na=candidate:2380096326 1 udp 1677729535 103.171.8.127 51166 typ srflx raddr 0.0.0.0 rport 0 generation 0 network-cost 999\r\na=ice-ufrag:17nu\r\na=ice-pwd:XmrzTna+89kyNqHS1oSNocj5\r\na=fingerprint:sha-256 B9:44:D0:BF:29:99:16:E3:6E:77:5E:2C:68:5F:BB:FA:B1:59:31:E4:2E:39:22:9E:99:A8:BC:55:EB:EC:8A:B6\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n"}`;

    const compressedString = await compress(input, 'gzip');
    const urlFriendly = encodeURIComponent(compressedString);

    console.log('compressedString: ', compressedString);
    console.log('urlFriendly: ', urlFriendly);

    const decodedString = decodeURIComponent(urlFriendly);
    const output = await decompress(decodedString, 'gzip');

    console.log('decodedString: ', decodedString);
    console.log('output: ', output);

    console.assert(input === output);
  }

  toggleDialogState(): void {
    // this.visible = !this.visible;

    this.showPlaygroundDialog = true;

    // this.showPlaygroundDialog = false;
    // this.showTokenDialog = true;
  }

  joinExistingPlayground(): void {
    if (this.playerName.trim().length > 0) {
      this._playgroundService.joinExistingPlayground(this.playerName);
      this.nextStage = true;
      // this.showPlaygroundDialog = false;
      // this.showTokenDialog = true;
    }
  }

  createNewPlayground(): void {
    if (this.playerName.trim().length > 0) {
      this._playgroundService.createNewPlayground(this.playerName);
      this.createPlayground = true;
      this.nextStage = true;
      // this.showDialog();
      // this.showPlaygroundDialog = false;
      // this.showTokenDialog = true;
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

  // sendTokenForPlayground(): void {
  //   if (this.token.trim().length > 0) {
  //     this._playgroundService.sendTokenForPlayground(this.token);
  //     this.showTokenDialog = false;
  //   } else {
  //     // NOTE - Show Toaster
  //   }
  // }

}

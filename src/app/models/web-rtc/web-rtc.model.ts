export class WebRtcModel {

  // // Set up an asynchronous communication channel that will be
  // // used during the peer connection setup
  // private _signalingChannel: any;
  // private readonly _configuration = { 'iceServers' : [{ 'urls': 'stun:stun.l.google.com:19302' }] };

  // // PC1
  // async makeCall()  {
  //   const peerConnection = new RTCPeerConnection(this._configuration);
  //   this._signalingChannel.addEventListener('message', async message => {
  //       if (message.answer) {
  //           const remoteDesc = new RTCSessionDescription(message.answer);
  //           await peerConnection.setRemoteDescription(remoteDesc);
  //       }
  //   });
  //   const offer = await peerConnection.createOffer();
  //   await peerConnection.setLocalDescription(offer);
  //   this._signalingChannel.send({'offer': offer});
  // }

  private _createPlayground?: boolean;

  private _signaling: BroadcastChannel;
  // private _receiver: BroadcastChannel;
  // private peerConnection: any;
  private _isReady: boolean = false;

  private _localConnection: any;
  private _remoteConnection: any;
  private _chatChannel: any;
  private _sendChannel: any = null;
  private _receiveChannel: any;

  playerName: string = '';

  constructor() {
    // NOTE - This is where it begins!
    this._signaling = new BroadcastChannel('webrtc');
    // this._receiver = new BroadcastChannel('webrtc');
    this.handleSignalingEvents();
  }

  get createPlayground(): boolean {
    return !!this._createPlayground;
  }
  set createPlayground(value: boolean) {
    this._createPlayground = value;
  }

  get peerConnection() {
    return this.createPlayground ? this._localConnection : this._remoteConnection;
  }
  set peerConnection(value: any) {
    // this.peerConnection = value;
    this.createPlayground ? this._localConnection = value : this._remoteConnection = value;
  }

  get isReady(): boolean {
    return this._isReady;
  }
  set isReady(value: boolean) {
    this._isReady = value;
  }

  // private peerConnection(peer: any) {
  //   return (peer === this._localConnection) ? this._localConnection : this._remoteConnection;
  // }

  private handleSignalingEvents(): void {
    this._signaling.onmessage = e => {
    // this._receiver.onmessage = e => {
      if (!this._isReady) {
        console.log('yeah not ready yet');
        return;
      }
      switch (e.data.type) {
        case 'offer':
          this.handleOffer(e.data);
          break;
        case 'answer':
          this.handleAnswer(e.data);
          break;
        case 'candidate':
          this.handleCandidate(e.data);
          break;
        case 'ready':
          // A second tab joined. This tab will initiate a call unless in a call already.
          if (this.peerConnection) {
            console.log('already in call, ignoring');
            return;
          }
          this.makeCall();
          break;
        case 'bye':
          if (this.peerConnection) {
            this.hangup();
          }
          break;
        case 'message':

          break;
        default:
          console.log('unhandled', e);
          break;
      }
    };

    this._signaling.onmessageerror = err => {
      console.log('err: ', err);
    }
  }

  async hangup() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this._isReady = false;

    // this._localStream.getTracks().forEach((track: any) => track.stop());
    // this._localStream = null;
    // startButton.disabled = false;
    // hangupButton.disabled = true;
  };

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection();

    if (this.createPlayground) {
      this._sendChannel = this.peerConnection.createDataChannel('sendDataChannel');
    }

    this.peerConnection.onicecandidate = (e: any) => {
      const message: any = {
        type: 'candidate',
        candidate: null,
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      this._signaling.postMessage(message);
    };
    // pc.ontrack = e => remoteVideo.srcObject = e.streams[0];
    // localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  async makeCall() {
    await this.createPeerConnection();

    const offer = await this.peerConnection.createOffer();
    this._signaling.postMessage({type: 'offer', sdp: offer.sdp});
    await this.peerConnection.setLocalDescription(offer);
  }

  async handleOffer(offer: any) {
    if (this.peerConnection) {
      console.error('existing peer connection');
      return;
    }
    await this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(offer);

    const answer = await this.peerConnection.createAnswer();
    this._signaling.postMessage({type: 'answer', sdp: answer.sdp});
    await this.peerConnection.setLocalDescription(answer);
  }

  async handleAnswer(answer: any) {
    if (!this.peerConnection) {
      console.error('no peer connection');
      return;
    }
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleCandidate(candidate: any) {
    if (!this.peerConnection) {
      console.error('no peer connection');
      return;
    }
    if (!candidate.candidate) {
      await this.peerConnection.addIceCandidate(null);
    } else {
      await this.peerConnection.addIceCandidate(candidate);
    }
  }

  // async sendMessageOnChatChannel(e: any) {
  //   this._chatChannel.onopen = e => {
  //       console.log('chat channel is open', e);
  //   }
  //   this._chatChannel.onmessage = (e: any) => {
  //       // chat.innerHTML = chat.innerHTML + "<pre>" + e.data + "</pre>"
  //       console.log(``)
  //   }
  //   this._chatChannel.onclose = () => {
  //       console.log('chat channel closed');
  //   }
  // }

  public initiateWebRtc(): void {
    this._isReady = true;
    this._signaling.postMessage({type: 'ready'});
  }

  public terminateWebRtc(): void {
    this._signaling.postMessage({type: 'bye'});
  }

}

import Peer, { DataConnection } from 'peerjs';
import ShareDisplayCanvas from './ShareDisplayCanvas';
//import Electron from 'electron';
const Electron = window.require('electron'); //怪しげな現象が発生したので先人に習う https://github.com/electron/electron/issues/7300

//後始末の処理は書いてないので注意

export default class ShareDisplayPeer {
	private peer: Peer | null = null;
	constructor(
		private video: HTMLVideoElement,
		private canvas: ShareDisplayCanvas,
		private peerId: string,
		private hostName: string,
		private port: number,
		private path: string
	) {
		this.peer = new Peer(peerId, {
			host: hostName,
			port: port,
			path: path,
		});
	}

	//待ち受け開始
	public startWaiting(): void {
		if (this.peer == null) return;
		const peer: Peer = this.peer;

		//サーバーとの接続確立
		peer.on('open', (id: string) => {
			console.log('my peer id : ' + id);
		});
		//エラー
		peer.on('error', (err: any) => {
			console.log('Peer Error: ' + err);
		});
		//Stream受信接続確立 (Video)
		peer.on('call', call => {
			console.log('remote call received.');

			//Answer the call with an A/V stream.
			call.answer();

			//Streamを受信したらVideoで再生
			call.on('stream', (remoteStream: MediaStream) => {
				this.setStreamToVideo(remoteStream);
			});
			console.log('stream receive callback set.');
		});
		//Data受信接続確立 (Mouse操作)
		peer.on('connection', (conn: DataConnection) => {
			console.log('remote connection received.');
			this.setDetaConnection(conn);
		});
	}

	setStreamToVideo(remoteStream: MediaStream): void {
		console.log('remote stream received.');
		this.video.srcObject = remoteStream;
		this.video.onloadedmetadata = e => this.video.play();
	}

	setDetaConnection(conn: DataConnection): void {
		//接続
		conn.on('open', () => {
			console.log('data connected.');

			this.canvas.sendMouseRoute = data => {
				console.log('sendMouseRoute before.');
				conn.send(data);
				console.log('sendMouseRoute after.');
			};
		});

		//データを受信したらキャンバスに描画
		conn.on('data', (data: any) => {
			console.log('Received. ', data);

			if (data instanceof Array) {
				this.canvas.clickStartEmulate();
				for (var i = 0; i < data.length; i += 2) {
					this.canvas.draw(data[i], data[i + 1], '255, 255, 0, 1');
				}
				this.canvas.clickEndEmulate();
			}
		});

		conn.on('error', function(err) {
			console.log('Error. ', err);
		});

		//マウス操作時にこのコネクションを使って送信するためのCallback
		this.canvas.sendMouseRoute = data => {
			console.log('sendMouseRoute before.');
			conn.send(data);
			console.log('sendMouseRoute after.');
		};
		console.log('sendMouseRout set.');
	}

	sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	public async startShareing(targetPeerId: string): Promise<void> {
		//video mandatoryがないって怒られるのでIFを勝手に拡張してみる
		interface MyMediaStreamConstraints extends MediaStreamConstraints {
			video: any;
		}

		//Peerサーバーとの接続を待つ
		for (var i = 0; i < 1000; i++) {
			await this.sleep(10);
			console.log('server connection wait ' + (i + 1) + ' times');
			if (!this.peer?.disconnected) {
				break;
			}
		}

		//マウス操作を送信するコネクションを開く
		if (this.peer != null) {
			const conn = this.peer.connect(targetPeerId);

			console.log('data connection open.');

			this.setDetaConnection(conn);
		}

		//デスクトップキャプチャを開始し、Streamを送信する
		Electron.desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async (sources: any) => {
			// window or screen
			console.log('capture sequence start.');
			for (const source of sources) {
				console.log('source name : ' + source.name);
				try {
					const constraints: MyMediaStreamConstraints = {
						audio: false,
						video: {
							mandatory: {
								chromeMediaSource: 'desktop',
								chromeMediaSourceId: source.id,
								minWidth: 1280,
								maxWidth: 1280,
								minHeight: 720,
								maxHeight: 720,
							},
						},
					};
					const stream = await navigator.mediaDevices.getUserMedia(constraints);
					console.log('get stream.');
					if (this.peer != null) {
						var call = this.peer.call(targetPeerId, stream);
						console.log('send stream.');
						//待ち受け
						call.on('stream', (remoteStream: MediaStream) => {
							this.setStreamToVideo(remoteStream);
						});
					}
					return;
				} catch (e) {
					console.log(e);
					//handleError(e);
				}
			}
		});

		return new Promise((resolve, reject) => {});
	}
}

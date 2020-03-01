import * as React from 'react';
import './ShareDisplay.css';
import ShareDisplayCanvas from './ShareDisplayCanvas';
import ShareDisplayPeer from './ShareDisplayPeer';

import icon_movie from './res/icon_movie.png';
import icon_pen from './res/icon_pen.png';
import icon_cross from './res/icon_cross.png';

interface ShareDisplayPropsInterface {}
interface ShareDisplayStateInterface {}
export default class ShareDisplay extends React.Component<ShareDisplayPropsInterface, ShareDisplayStateInterface> {
	sdcanvas: ShareDisplayCanvas | null = null;
	sdpeer: ShareDisplayPeer | null = null;

	render() {
		return (
			<div>
				<div id="video-root" className="video-root">
					<video id="shared-video" className="shared-video"></video>
				</div>
				<div id="canvas-root" className="canvas-root">
					<canvas id="vid-canvas" className="vid-canvas"></canvas>
				</div>

				<div className="tool-root">
					<button
						type="submit"
						className="sd-button"
						onClick={e => {
							this.startShare();
						}}
					>
						<img src={icon_movie} className="sd-button-img" alt="画面共有開始" />
					</button>
					<button
						type="submit"
						className="sd-button"
						onClick={e => {
							this.startWaiting();
						}}
					>
						<img src={icon_pen} className="sd-button-img" alt="待受開始" />
					</button>
					<button
						type="submit"
						className="sd-button"
						onClick={e => {
							window.close();
						}}
					>
						<img src={icon_cross} className="sd-button-img" alt="終了" />
					</button>
				</div>
			</div>
		);
	}

	componentDidMount() {
		this.sdcanvas = new ShareDisplayCanvas(document.getElementById('vid-canvas') as HTMLCanvasElement);
	}

	componentWillUnmount() {}

	//お絵描き側
	startWaiting() {
		this.sdpeer = new ShareDisplayPeer( //IDなど決め打ち
			document.getElementById('shared-video') as HTMLVideoElement,
			this.sdcanvas!,
			'peer_id_001',
			'localhost',
			9000,
			'myapp'
		);
		this.sdpeer.startWaiting();
	}
	//動画共有側
	startShare() {
		this.sdpeer = new ShareDisplayPeer( //IDなど決め打ち
			document.getElementById('shared-video') as HTMLVideoElement,
			this.sdcanvas!,
			'peer_id_002',
			'localhost',
			9000,
			'myapp'
		);
		this.sdpeer.startWaiting();
		this.sdpeer.startShareing('peer_id_001');

		//動画共有側はマウスイベントを透過させる　ボタンとタイトルバー以外
		const win = window.require('electron').remote.getCurrentWindow();
		let mouseTarget: HTMLDivElement = document.getElementById('canvas-root') as HTMLDivElement;
		mouseTarget.addEventListener('mouseover', e => {
			win.setIgnoreMouseEvents(true, { forward: true });
		});
		mouseTarget.addEventListener('mouseout', e => {
			win.setIgnoreMouseEvents(false);
		});
	}
}

export default class ShareDisplayCanvas {
	// canvas
	private ctx: CanvasRenderingContext2D | null = this.cnvs.getContext('2d')!;

	// drawing
	private cnvColor = '255, 0, 0, 1'; // 線の色
	private cnvBold = 10; // 線の太さ
	private clickState = 0; // クリック状態（0:なし、1:押下開始、2:移動中）

	// mouse
	private mouseArray: number[] = [];
	public sendMouseRoute: (arg: number[]) => void = () => {};

	constructor(private cnvs: HTMLCanvasElement) {
		this.cnvs.addEventListener(
			'mousedown',
			() => {
				this.canvas_mousedown();
			},
			false
		);
		this.cnvs.addEventListener(
			'mouseup',
			() => {
				this.canvas_mouseup();
			},
			false
		);
		this.cnvs.addEventListener(
			'mousemove',
			e => {
				this.canvas_mousemove(e);
			},
			false
		);
		window.addEventListener(
			'resize',
			() => {
				this.canvas_resize();
			},
			false
		);

		//ViewPort指定で初期サイズがおかしいのでリサイズ
		this.canvas_resize();
	}

	canvas_resize(): void {
		const element: HTMLElement = this.cnvs.parentElement!;
		this.cnvs.height = element.clientHeight;
		this.cnvs.width = element.clientWidth;
		console.log('Canvas Size Changed. w=' + this.cnvs.width + ', h=' + this.cnvs.height);

		if (this.ctx !== null) {
			this.ctx.strokeStyle = 'rgba(0,0,0)';
			this.ctx.beginPath();
			this.ctx.moveTo(0, 0);
			this.ctx.lineTo(this.cnvs.width, 0);
			this.ctx.lineTo(this.cnvs.width, this.cnvs.height);
			this.ctx.lineTo(0, this.cnvs.height);
			this.ctx.lineTo(0, 0);
			this.ctx.stroke();
		}
	}
	canvas_mousedown(): void {
		console.log('mouse_down');
		this.clickState = 1;
		this.mouseArray = [];
	}
	canvas_mouseup(): void {
		console.log('mouse_up');
		this.clickState = 0;
		if (this.sendMouseRoute != null) this.sendMouseRoute(this.mouseArray);
	}
	canvas_mousemove(e: MouseEvent): void {
		if (!this.clickState) {
			return;
		}
		this.cnvColor = '255, 0, 0, 1';
		this.draw(e.offsetX, e.offsetY, this.cnvColor);
		this.mouseArray[this.mouseArray.length] = e.offsetX;
		this.mouseArray[this.mouseArray.length] = e.offsetY;
	}

	// 描画処理
	public draw(x: number, y: number, cnvColor: string): void {
		if (this.ctx != null) {
			this.ctx.lineWidth = this.cnvBold;
			this.ctx.strokeStyle = 'rgba(' + cnvColor + ')';

			if (this.clickState === 1) {
				this.clickState = 2;
				this.ctx.beginPath();
				this.ctx.lineCap = 'round';
				this.ctx.moveTo(x, y);
			} else {
				this.ctx.lineTo(x, y);
			}
			this.ctx.stroke();
		}
	}
	public clickStartEmulate() {
		this.clickState = 1;
	}
	public clickEndEmulate() {
		this.clickState = 0;
	}

	public clear(): void {
		if (this.ctx != null) this.ctx.clearRect(0, 0, this.cnvs.width, this.cnvs.height);
	}
}

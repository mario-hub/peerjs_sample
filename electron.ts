const { app, BrowserWindow } = require('electron'); // Electron 本体

let main_gui = null;

app.on('window-all-closed', () => app.quit());

//process.argv[i]

app.on('ready', () => {
	let win_option = {
		transparent: true,
		resizable: true,
		alwaysOnTop: true,
		frame: false, // -webkit-app-region: drag;が必要
		width: 1280,
		height: 900,
		backgroundColor: '#0000',
		webPreferences: {
			experimentalFeatures: true, // 先行機能
			nodeIntegration: true, // 必須らしい
		},
	};
	main_gui = new BrowserWindow(win_option);

	//console.log('file:///' + __dirname + '/build/index.html');
	main_gui.loadURL('file:///' + __dirname + '/build/index.html');

	//main_gui.setIgnoreMouseEvents(true, { forward: true });
	//main_gui.webContents.openDevTools(); // debug

	main_gui.on('closed', () => (main_gui = null));
});

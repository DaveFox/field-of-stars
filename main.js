const {app, BrowserWindow} = require('electron');

//global window ref
let win;

function createMainWindow() {
  win = new BrowserWindow({width: 800, height: 600});

  win.loadFile('index.html');

  //debug tools
  win.webContents.openDevTools();

  win.on('closed', () => {
     win = null;
  })
}

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
  app.quit();
})
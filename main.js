const { app, BrowserWindow, screen, session, Notification, shell, ipcMain} = require('electron')
const {download} = require("electron-dl");
const server = require(__dirname+"/bin/www");
var path = require('path');

const nativeImage = require('electron').nativeImage; 

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const win = new BrowserWindow({
    width, height,
    icon: nativeImage.createFromPath(__dirname + '/image/trademark.png'),
    webPreferences: {
      plugins: true,
      nodeIntegration: false
    }
  })
  
  win.setMenuBarVisibility(false);
  if (process.env.NODE_ENV === 'development') win.webContents.openDevTools();
  win.loadURL('http://localhost:3000/', {userAgent: 'Chrome'});

  ipcMain.on("download", (event, info) => {
	  //let prop=info.properties;
        download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
            .then(dl => win.webContents.send("download complete", dl.getSavePath()));
    });
}

app.setAppUserModelId("  ");
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  // session.defaultSession.clearStorageData();
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

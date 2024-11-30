const { app, BrowserWindow, desktopCapturer, session } = require('electron')

const path = require('path') 
const env = process.env.NODE_ENV || 'development';
if (env === 'development') { 
    require('electron-reload')(__dirname, { 
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'), 
        hardResetMethod: 'exit'
    }); 
} 

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
          // Grant access to the first screen found.
          callback({ video: sources[0] })
        })
    })
    

    win.loadFile('index.html')
    win.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow();
    
})
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    processScreenshot: (imageData) => ipcRenderer.invoke('process-screenshot', imageData)
})
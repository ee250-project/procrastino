const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    processScreenshot: (imageData, inputText) => ipcRenderer.invoke('process-screenshot', imageData, inputText),
    // Add MQTT message listener
    onMqttMessage: (callback) => {
        ipcRenderer.on('mqtt-message', (event, data) => callback(data))
    },
    // Remove MQTT message listener
    removeMqttListener: (callback) => {
        ipcRenderer.off('mqtt-message', callback)
    }
})
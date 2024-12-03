const { app, BrowserWindow, desktopCapturer, session, ipcMain } = require('electron')
const OpenAI = require('openai')
const mqtt = require('mqtt')
require('dotenv').config()

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
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
          callback({ video: sources[0] })
        })
    })

    win.loadFile('index.html')
    win.webContents.openDevTools()
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Handle OpenAI API calls from renderer
ipcMain.handle('process-screenshot', async (event, imageData, inputText) => {
    try {
        // Remove the data URL prefix to get just the base64 data
        const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "The user is asked what they are working on today on their computer. Here is their answer: " + inputText + ". Your job is to look at a screenshot of the user's screen and decide if that user is actually working on what they said they are working on. They are procrastinating if and only if they are doing something ENTIRELY unrelated to what they are working on. The user may have a timer app called 'ProcrastiNO' opened, and it has a pink gradient background. If you see this, DO NOT count it as procrastinating. The user IS NOT procrastinating if they have this app open." 
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "screenshot_analysis_schema",
                    schema: {
                        type: "object",
                        properties: {
                            procrastinating: {
                                description: "Whether the screenshot indicates the user is procrastinating or not.",
                                type: "boolean"
                            },
                            warning: {
                                description: "A gentle and short warning message to the user, if and only if they are procrastinating. Otherwise, don't say anything.",
                                type: "string"
                            }
                        },
                        additionalProperties: false
                    }
                }
            }
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error processing screenshot:', error);
        throw error;
    }
});

// MQTT Client setup
const MQTT_BROKER = 'broker.hivemq.com'
const MQTT_PORT = 1883
const MQTT_TOPIC = 'ultrasonic/sensor'

let mqttClient
function setupMQTT() {
    mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`)
    
    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker')
        mqttClient.subscribe(MQTT_TOPIC, (err) => {
            if (err) {
                console.error('Error subscribing to topic:', err)
                return
            }
            console.log(`Subscribed to topic: ${MQTT_TOPIC}`)
        })
    })

    mqttClient.on('message', (topic, message) => {
        console.log(`Received message on topic ${topic}:`, message.toString())
        // Forward MQTT messages to renderer process
        BrowserWindow.getAllWindows().forEach(window => {
            window.webContents.send('mqtt-message', message.toString())
        })
    })

    mqttClient.on('error', (err) => {
        console.error('MQTT Error:', err)
    })
}

app.whenReady().then(() => {
    createWindow()
    setupMQTT()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (mqttClient) {
            mqttClient.end()
        }
        app.quit()
    }
})
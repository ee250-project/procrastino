const { app, BrowserWindow, desktopCapturer, session, ipcMain } = require('electron')
const OpenAI = require('openai')
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

app.whenReady().then(() => {
    createWindow();
})
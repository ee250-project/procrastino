// screenshot
const screenshotButton = document.getElementById('screenshot-button');
const screenshotImage = document.getElementById('screenshot-image');
let screenshotInterval;

async function takeScreenshot() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
    
    // Get the video track from the stream
    const videoTrack = stream.getVideoTracks()[0];
    
    // Create a video element to capture the stream
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    
    // Create a canvas to draw the screenshot
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a data URL and set it as the image source
    screenshotImage.src = canvas.toDataURL('image/png');
    
    // Stop the stream
    stream.getTracks().forEach(track => track.stop());
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

// process screenshot
async function processScreen() {
  // take screenshot
  await takeScreenshot();

  try {
    const inputText = document.getElementById('user-input').value;
    let response = await window.electronAPI.processScreenshot(screenshotImage.src, inputText);
    response = JSON.parse(response);

    console.log('Response type:', typeof response);

    if (response.procrastinating === true) {
      console.log('Procrastinating!!!!');
      new Notification("ProcrastiNO", { body: response.warning });
      procrastCount++;
    }

    console.log('OpenAI Response:', response);
    // Handle the response as needed
  } catch (error) {
      console.error('Error processing screenshot:', error);
  }
}

// timer start/stop and take screenshots
let timerInterval;
let seconds = 0;
let isRunning = false;
let mqttData = []; // Array to store MQTT data
let mqttListener = null;
let procrastCount = 0;
const THRESHOLD = 80;

const timerSection = document.getElementById('timer-section');
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const resultsModal = document.getElementById('results-modal');
const totalTimeElement = document.getElementById('total-time');
const totalPresentElement = document.getElementById('total-present');
const totalAbsentElement = document.getElementById('total-absent');
const procrastCountElement = document.getElementById('procrast-count');
const modalOkButton = document.getElementById('modal-ok-button');


function updateDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

startButton.addEventListener('click', () => {
    if (!isRunning) {
        seconds = 0; // Reset the timer
        updateDisplay();
        isRunning = true;
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        timerSection.style.display = 'inline-block';
        mqttData = []; // Reset MQTT data array
        procrastCount = 0;
        
        // Start collecting MQTT data
        mqttListener = (data) => {
            if (isRunning) {
                mqttData.push(JSON.parse(data).distance);
                console.log(mqttData);
            }
        };
        window.electronAPI.onMqttMessage(mqttListener);

        timerInterval = setInterval(() => {
            seconds++;
            updateDisplay();
        }, 1000);
        // take screenshot every 10 seconds
        screenshotInterval = setInterval(processScreen, 10000);
    }
});

stopButton.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        updateDisplay(); // Update the display to show 00:00:00
        startButton.style.display = 'block';
        stopButton.style.display = 'none';
        timerSection.style.display = 'none';
        clearInterval(timerInterval);
        clearInterval(screenshotInterval);

        // Stop collecting MQTT data
        if (mqttListener) {
            window.electronAPI.removeMqttListener(mqttListener);
            mqttListener = null;
        }

        // Process MQTT data
        console.log(`Total time elapsed: ${seconds} seconds`);
        const unitTime = seconds / mqttData.length;
        const totalTime = seconds;
        let totalPresent = 0, totalAbsent = 0;
        for (let i = 0; i < mqttData.length; i++) {
            if (mqttData[i] > THRESHOLD) 
                totalAbsent += unitTime;
            else 
                totalPresent += unitTime;
        }
        totalAbsent = Math.round(totalAbsent);
        totalPresent = Math.round(totalPresent);

        // update values in modal
        totalTimeElement.textContent = `${totalTime} s`;
        totalPresentElement.textContent = `${totalPresent} s`;
        totalAbsentElement.textContent = `${totalAbsent} s`;
        procrastCountElement.textContent = `${procrastCount} times`;
        
        resultsModal.style.display = 'block';
    }
});

modalOkButton.addEventListener('click', () => {
  resultsModal.style.display = 'none';
});
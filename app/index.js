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

// timer start/stop and take screenshots
let timerInterval;
let seconds = 0;
let isRunning = false;

const timerSection = document.getElementById('timer-section');
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');

function updateDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

startButton.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        timerSection.style.display = 'inline-block';
        timerInterval = setInterval(() => {
          seconds++;
          updateDisplay();

          new Notification("ProcrastiNO", { body: "hello" })
        }, 1000);
        // take screenshot every 5 seconds
        screenshotInterval = setInterval(takeScreenshot, 2000);
    }
});

stopButton.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        startButton.style.display = 'block';
        stopButton.style.display = 'none';
        timerSection.style.display = 'none';
        clearInterval(timerInterval);
        clearInterval(screenshotInterval);
    }
});
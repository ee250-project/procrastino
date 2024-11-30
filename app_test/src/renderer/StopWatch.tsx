import { useState, useEffect } from 'react';
import './StopWatch.css';

export default function StopWatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const { desktopCapturer } = window.require('electron');

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const takeScreenshot = async () => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      console.log(sources[0].thumbnail.toDataURL());
    });
  };

  return (
    <div className="stopwatch">
      <div className="time-display">{formatTime(time)}</div>
      <div className="controls">
        <button type="button" onClick={handleStartStop}>
          I&apos;m done!
        </button>
      </div>
      <button id="screenshot-button" onClick={takeScreenshot}>
        snap
      </button>
      <img id="screenshot-image" />
    </div>
  );
}

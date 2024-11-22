"use client";
import { Fragment, useEffect, useState } from "react";
// https://reactpractice.dev/exercise/build-a-pomodoro-app

const Pomodoro = () => {
  const [time, setTime] = useState<Date>(new Date(25 * 60 * 1000));
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const intervalId = setInterval(() => {
      setTime((state) => {
        const newTime = new Date(state.getTime() - 1000);
        if (newTime.getTime() <= 0) {
          setIsRunning(false);
          return new Date(25 * 60 * 1000);
        }
        return newTime;
      });
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const pauseTimer = () => {
    stopTimer();
  };

  const restartTimer = () => {
    stopTimer();
    setTime(new Date(25 * 60 * 1000));
  };

  return (
    <div className="border-black border-solid">
      <h1>{`${time.getMinutes()}-${time
        .getSeconds()
        .toString()
        .padEnd(2, "0")}`}</h1>

      <div className="flex gap-x-2">
        {isRunning && (
          <Fragment>
            <button onClick={restartTimer}>Restart</button>
            <button onClick={pauseTimer}>Pause</button>
          </Fragment>
        )}
        {!isRunning && <button onClick={startTimer}>Start</button>}
      </div>
    </div>
  );
};

export default Pomodoro;

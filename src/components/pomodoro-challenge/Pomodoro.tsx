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
    const timeInterval = 1000;
    const intervalId = setInterval(() => {
      setTime((state) => {
        const newTime = new Date(state.getTime() - timeInterval);
        if (newTime.getTime() <= 0) {
          setIsRunning(false);
          return new Date(25 * 60 * 1000);
        }
        return newTime;
      });
    }, timeInterval);

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
    <div className="flex justify-center px-2">
      <div className="border-white border-solid border max-w-md flex-1 flex flex-col items-center p-4 gap-y-2 rounded-sm">
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
    </div>
  );
};

export default Pomodoro;

"use client";
import { Fragment, useEffect, useState } from "react";
import { Button } from "./Button";
import { RefreshCw } from "react-feather";

export type TimerProps = {
  duration: number;
  label: string;
  actionsBefore?: React.ReactNode;
  actionsAfter?: React.ReactNode;
  onComplete?: () => void;
};

const minutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    minute: "numeric",
    second: "numeric",
  }).format(date);
};

export const Timer = ({
  duration,
  actionsAfter,
  actionsBefore,
  label,
  onComplete,
}: TimerProps) => {
  const [time, setTime] = useState<Date>(
    new Date(minutesToMilliseconds(duration))
  );
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const timeInterval = 1000;
    const intervalId = setInterval(() => {
      setTime((state) => {
        return new Date(state.getTime() - timeInterval);
      });
    }, timeInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    if (time.getTime() <= 0) {
      setIsRunning(false);
      setTime(new Date(minutesToMilliseconds(duration)));
      onComplete?.();
    }
  }, [duration, time, onComplete, isRunning]);

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
    setTime(new Date(minutesToMilliseconds(duration)));
  };
  return (
    <div className="border-white border-solid border max-w-md flex-1 flex flex-col items-center p-4 gap-y-2 rounded-sm">
      <h2>{formatTime(time)}</h2>

      <div className="flex gap-x-2">
        {isRunning && (
          <Fragment>
            {actionsBefore}
            <Button aria-label="restart" title="restart" onClick={restartTimer}>
              <RefreshCw />
            </Button>
            <Button onClick={pauseTimer}>Pause</Button>
            {actionsAfter}
          </Fragment>
        )}
        {!isRunning && <Button onClick={startTimer}>{`Start ${label}`}</Button>}
      </div>
    </div>
  );
};

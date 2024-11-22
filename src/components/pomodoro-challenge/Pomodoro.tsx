"use client";
import { useState } from "react";
import { Timer } from "./Timer";
import { Button } from "./Button";
import { SkipForward } from "react-feather";
// https://reactpractice.dev/exercise/build-a-pomodoro-app

type Session = {
  label: string;
  timeInMinutes: number;
};

const MAX_SESSIONS = 4;

const SESSION = [
  {
    label: "focus time",
    timeInMinutes: 25,
  },
  {
    label: "short break",
    timeInMinutes: 5,
  },
  {
    label: "long break",
    timeInMinutes: 20,
  },
];

const SESSION_STEPS = SESSION.length;

const SESSIONS: Session[][] = Array.from({ length: MAX_SESSIONS }, () => {
  return SESSION;
});

const Pomodoro = () => {
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);
  const [currentSessionTypeIdx, setCurrentSessionTypeIdx] = useState(0);

  const { label, timeInMinutes } =
    SESSIONS[currentSessionIdx][currentSessionTypeIdx];

  const moveToNextSession = () => {
    if (currentSessionTypeIdx === SESSION_STEPS - 1) {
      setCurrentSessionIdx((currentSessionIdx + 1) % MAX_SESSIONS);
      setCurrentSessionTypeIdx(0);
      return;
    }
    setCurrentSessionTypeIdx(currentSessionTypeIdx + 1);
  };

  return (
    <div className="flex flex-col items-center gap-y-2 p-3">
      <h1>{`Session ${
        currentSessionIdx + 1
      } of ${MAX_SESSIONS} (${label})`}</h1>
      <Timer
        key={`${currentSessionIdx}-${currentSessionTypeIdx}`}
        duration={timeInMinutes}
        onComplete={moveToNextSession}
        label={label}
        actionsAfter={
          <Button onClick={moveToNextSession}>
            <SkipForward />
          </Button>
        }
      />
    </div>
  );
};

export default Pomodoro;

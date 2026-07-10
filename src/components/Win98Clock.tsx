"use client";

import { useEffect, useState } from "react";

const getTime = () =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

export default function Win98Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setTime(getTime()), 0);
    const interval = window.setInterval(() => setTime(getTime()), 30_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return <span className="win98-clock">{time || "--:--"}</span>;
}

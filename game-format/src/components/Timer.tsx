import React, { useState, useEffect } from "react";

interface TimerProps {
  minutes: number;
  onComplete?: () => void; // optional callback when timer hits 0
}

const Timer: React.FC<TimerProps> = ({ minutes, onComplete }) => {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    setSecondsLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
      {formatTime(secondsLeft)}
    </div>
  );
};

export default Timer;

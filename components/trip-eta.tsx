import { useEffect, useState } from "react";
import { Type } from "./ui";
import { motionProgress, type RouteMotion } from "./maps/model";
import { useMotionActive } from "../lib/motion";
export function TripEta({
  motion,
  minutes,
  arrived,
}: {
  motion?: RouteMotion;
  minutes: number;
  arrived: boolean;
}) {
  const active = useMotionActive();
  const value = () =>
    arrived
      ? 0
      : Math.max(
          1,
          Math.ceil(minutes * (1 - (motion ? motionProgress(motion) : 0))),
        );
  const [eta, setEta] = useState(value);
  useEffect(() => {
    setEta(value());
    if (!active || !motion || motion.clock.paused) return;
    const t = setInterval(() => setEta(value()), 1000);
    return () => clearInterval(t);
  }, [active, motion, minutes, arrived]);
  return (
    <Type size={24} weight="bold">
      {eta}
    </Type>
  );
}

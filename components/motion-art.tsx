import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import LottieView from "lottie-react-native";
import { useReducedMotion } from "react-native-reanimated";
import { motionSources, type MotionArtProps } from "./motion-sources";
export function MotionArt({ kind, size = 100, active = true }: MotionArtProps) {
  const ref = useRef<LottieView>(null),
    reduced = useReducedMotion();
  useEffect(() => {
    const play = () => {
      if (active && !reduced && AppState.currentState === "active")
        ref.current?.play();
      else ref.current?.pause();
    };
    play();
    const sub = AppState.addEventListener("change", play);
    return () => {
      sub.remove();
      ref.current?.pause();
    };
  }, [active, reduced, kind]);
  return (
    <LottieView
      ref={ref}
      source={motionSources[kind]}
      style={{ width: size, height: size }}
      loop={false}
      progress={reduced ? 1 : undefined}
      onAnimationLoaded={() => {
        if (active && !reduced) ref.current?.play();
      }}
    />
  );
}

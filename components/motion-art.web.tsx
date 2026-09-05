import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { motionSources, type MotionArtProps } from "./motion-sources";
export function MotionArt({ kind, size = 100, active = true }: MotionArtProps) {
  const host = useRef<View>(null),
    reduced = useReducedMotion();
  useEffect(() => {
    let cancelled = false;
    let animation: import("lottie-web").AnimationItem | undefined;
    const visible = () => {
      if (active && !reduced && !document.hidden) animation?.play();
      else animation?.pause();
    };
    void import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !host.current) return;
      animation = lottie.loadAnimation({
        container: host.current as unknown as Element,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: structuredClone(motionSources[kind]),
      });
      animation.addEventListener("DOMLoaded", () => {
        if (reduced) animation?.goToAndStop(89, true);
        else visible();
      });
    });
    document.addEventListener("visibilitychange", visible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", visible);
      animation?.destroy();
    };
  }, [kind, active, reduced]);
  return <View ref={host} aria-hidden style={{ width: size, height: size }} />;
}

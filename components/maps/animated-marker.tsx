import { forwardRef, useEffect, useRef } from "react";
import {
  Marker,
  type MarkerProps,
  type MarkerRef,
} from "@maplibre/maplibre-react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
const NativeMarker = forwardRef<MarkerRef, MarkerProps>((props, ref) => (
  <Marker {...props} ref={ref} />
));
const AnimatedMarker = Animated.createAnimatedComponent(NativeMarker);
/** Interpolate each tracking sample on the UI thread; gestures stay independent. */
export function MovingMarker({ lngLat, ...props }: MarkerProps) {
  const initial = useRef(lngLat),
    lng = useSharedValue(lngLat[0]),
    lat = useSharedValue(lngLat[1]),
    reduced = useReducedMotion();
  useEffect(() => {
    const config = { duration: reduced ? 0 : 480, easing: Easing.linear };
    lng.value = withTiming(lngLat[0], config);
    lat.value = withTiming(lngLat[1], config);
  }, [lngLat[0], lngLat[1], reduced, lng, lat]);
  const animatedProps = useAnimatedProps(() => ({
    lngLat: [lng.value, lat.value] as [number, number],
  }));
  return (
    <AnimatedMarker
      {...props}
      lngLat={initial.current}
      animatedProps={animatedProps}
    />
  );
}

import { forwardRef, useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import {
  Marker,
  type MarkerProps,
  type MarkerRef,
} from "@maplibre/maplibre-react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { Navigation } from "lucide-react-native";
import { motionProgress, type RouteMotion } from "./model";
import { usePalette } from "../../lib/theme";
const NativeMarker = forwardRef<MarkerRef, MarkerProps>((props, ref) => (
  <Marker {...props} ref={ref} />
));
const AnimatedMarker = Animated.createAnimatedComponent(NativeMarker);
export function MovingMarker({
  lngLat,
  motion,
  active = true,
  children,
  ...props
}: MarkerProps & { motion?: RouteMotion; active?: boolean }) {
  const initial = useRef(lngLat),
    progress = useSharedValue(motion ? motionProgress(motion) : 0),
    lng = useSharedValue(lngLat[0]),
    lat = useSharedValue(lngLat[1]),
    reduced = useReducedMotion(),
    p = usePalette();
  const points = motion?.route.coordinates;
  const geometry = useMemo(() => {
    if (!points) return null;
    const cumulative = [0];
    for (let i = 1; i < points.length; i++)
      cumulative.push(
        cumulative[i - 1] +
          Math.hypot(
            (points[i][0] - points[i - 1][0]) *
              Math.cos((points[i][1] * Math.PI) / 180),
            points[i][1] - points[i - 1][1],
          ),
      );
    return { points, cumulative, total: cumulative[cumulative.length - 1] };
  }, [points]);
  useEffect(() => {
    if (!motion) {
      lng.set(
        withTiming(lngLat[0], {
          duration: reduced ? 0 : 450,
          easing: Easing.linear,
        }),
      );
      lat.set(
        withTiming(lngLat[1], {
          duration: reduced ? 0 : 450,
          easing: Easing.linear,
        }),
      );
      return;
    }
    const start = motionProgress(motion);
    progress.set(start);
    if (active && !reduced && !motion.clock.paused)
      progress.set(
        withTiming(0.95, {
          duration: Math.max(
            0,
            ((0.95 - start) * motion.duration) / motion.clock.speed,
          ),
          easing: Easing.linear,
        }),
      );
    return () => cancelAnimation(progress);
  }, [motion, active, reduced, lngLat[0], lngLat[1]]);
  function sample(value: number, longitude: number, latitude: number) {
    "worklet";
    if (!geometry)
      return {
        coordinate: [longitude, latitude] as [number, number],
        bearing: 0,
      };
    const target = value * geometry.total;
    let lo = 0,
      hi = geometry.cumulative.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (geometry.cumulative[mid] <= target) lo = mid;
      else hi = mid;
    }
    const a = geometry.points[lo],
      b = geometry.points[hi],
      span = geometry.cumulative[hi] - geometry.cumulative[lo],
      t = span
        ? Math.max(0, Math.min(1, (target - geometry.cumulative[lo]) / span))
        : 0;
    return {
      coordinate: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as [
        number,
        number,
      ],
      bearing:
        (Math.atan2(
          (b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180),
          b[1] - a[1],
        ) *
          180) /
        Math.PI,
    };
  }
  // Read shared values in the mapper so Reanimated tracks their dependencies.
  const animatedProps = useAnimatedProps(() => ({
    lngLat: sample(progress.get(), lng.get(), lat.get()).coordinate,
  }));
  const heading = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${sample(progress.get(), lng.get(), lat.get()).bearing - 45}deg`,
      },
    ],
  }));
  return (
    <AnimatedMarker
      {...props}
      lngLat={initial.current}
      animatedProps={animatedProps}
    >
      <View collapsable={false}>
        {motion && (
          <Animated.View
            style={[{ alignItems: "center", height: 20 }, heading]}
          >
            <Navigation size={20} fill={p.primary} color={p.card} />
          </Animated.View>
        )}
        {children}
      </View>
    </AnimatedMarker>
  );
}

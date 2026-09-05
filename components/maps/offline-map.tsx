import { useEffect, useMemo } from "react";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  cancelAnimation,
  useReducedMotion,
} from "react-native-reanimated";
import { useMotionActive } from "../../lib/motion";
import { motionProgress, type MapMarker } from "./model";
import { View } from "react-native";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import { Type } from "../ui";
import { usePalette } from "../../lib/theme";
import { routeBounds } from "../../shared/transport";
import type { RouteMapProps } from "./model";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
function OfflinePin({
  marker,
  bounds,
}: {
  marker: MapMarker;
  bounds: number[];
}) {
  const p = usePalette(),
    active = useMotionActive(),
    reduced = useReducedMotion(),
    motion = marker.motion,
    progress = useSharedValue(motion ? motionProgress(motion) : 0);
  const geometry = useMemo(() => {
    const source = motion?.route.coordinates ?? [
      marker.coordinate,
      marker.coordinate,
    ];
    const points = source.map(([x, y]) => [
      35 + ((x - bounds[0]) / (bounds[2] - bounds[0] || 1)) * 330,
      260 - ((y - bounds[1]) / (bounds[3] - bounds[1] || 1)) * 220,
    ]);
    const lengths = [0];
    for (let i = 1; i < points.length; i++)
      lengths.push(
        lengths[i - 1] +
          Math.hypot(
            points[i][0] - points[i - 1][0],
            points[i][1] - points[i - 1][1],
          ),
      );
    return { points, lengths };
  }, [
    motion?.route,
    marker.coordinate[0],
    marker.coordinate[1],
    bounds.join(","),
  ]);
  useEffect(() => {
    if (!motion) return;
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
  }, [motion, active, reduced]);
  const props = useAnimatedProps(() => {
    const { points, lengths } = geometry,
      target = progress.get() * lengths[lengths.length - 1];
    let lo = 0,
      hi = points.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid] <= target) lo = mid;
      else hi = mid;
    }
    const t = (target - lengths[lo]) / (lengths[hi] - lengths[lo] || 1);
    return {
      cx: points[lo][0] + (points[hi][0] - points[lo][0]) * t,
      cy: points[lo][1] + (points[hi][1] - points[lo][1]) * t,
    };
  });
  return (
    <AnimatedCircle
      animatedProps={props}
      r={marker.kind ? 9 : 7}
      fill={marker.kind ? p.accent : p.primary}
      stroke={p.card}
      strokeWidth={3}
    />
  );
}
/** A deliberately labelled route diagram; it makes no network requests. */
export function OfflineMap({ route, markers }: RouteMapProps) {
  const p = usePalette(),
    [w, s, e, n] = routeBounds(route),
    project = ([x, y]: number[]) => [
      35 + ((x - w) / (e - w || 1)) * 330,
      260 - ((y - s) / (n - s || 1)) * 220,
    ],
    line = route.coordinates
      .map((v, i) => `${i ? "L" : "M"}${project(v).join(",")}`)
      .join(" ");
  return (
    <View
      style={{ flex: 1, backgroundColor: p.muted, justifyContent: "center" }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 400 300">
        <Path d={line} fill="none" stroke={p.card} strokeWidth={12} />
        <Path
          d={line}
          fill="none"
          stroke={p.primary}
          strokeWidth={5}
          strokeLinecap="round"
        />
        {markers.map((marker) => (
          <OfflinePin key={marker.id} marker={marker} bounds={[w, s, e, n]} />
        ))}
      </Svg>
      <View style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
        <Type size={11} weight="medium">
          Offline route preview · Saved road geometry
        </Type>
      </View>
    </View>
  );
}

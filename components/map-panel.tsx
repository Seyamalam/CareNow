import { useState, type ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";
import { Card } from "panelui-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { usePalette } from "../lib/theme";
import { Button } from "./button";
export function MapPanel({
  children,
  footer,
  wide,
}: {
  children: ReactNode;
  footer: ReactNode;
  wide: boolean;
}) {
  const p = usePalette(),
    { height } = useWindowDimensions(),
    reduced = useReducedMotion(),
    travel = 140,
    [expanded, setExpanded] = useState(false),
    offset = useSharedValue(travel),
    origin = useSharedValue(travel);
  const maximum = Math.max(390, Math.min(560, height * 0.66));
  const snap = (up: boolean) => {
    setExpanded(up);
    offset.set(
      withSpring(up ? 0 : travel, {
        duration: 300,
        dampingRatio: 1,
        reduceMotion: undefined,
      }),
    );
  };
  const pan = Gesture.Pan()
    .onBegin(() => {
      origin.set(offset.get());
    })
    .onUpdate((e) => {
      offset.set(Math.max(0, Math.min(travel, origin.get() + e.translationY)));
    })
    .onEnd((e) => {
      const up =
        e.velocityY < -300 || (e.velocityY < 300 && offset.get() < travel / 2);
      offset.set(
        withSpring(up ? 0 : travel, {
          duration: reduced ? 0 : 300,
          dampingRatio: 1,
        }),
      );
      scheduleOnRN(setExpanded, up);
    });
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.get() }],
  }));
  if (wide)
    return (
      <Card style={{ width: 400, borderRadius: 0, flexShrink: 0 }}>
        {children}
        {footer}
      </Card>
    );
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: maximum,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: maximum,
            backgroundColor: p.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: p.border,
          },
          style,
        ]}
      >
        <GestureDetector gesture={pan}>
          <View collapsable={false}>
            <Button
              variant="ghost"
              accessibilityLabel={
                expanded ? "Collapse booking panel" : "Expand booking panel"
              }
              onPress={() => snap(!expanded)}
              style={{ height: 30, padding: 0 }}
            >
              <View
                style={{
                  height: 4,
                  width: 38,
                  borderRadius: 2,
                  backgroundColor: p.border,
                }}
              />
            </Button>
          </View>
        </GestureDetector>
        <View style={{ height: maximum - 30 - 118 - (expanded ? 0 : travel) }}>
          {children}
        </View>
      </Animated.View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: p.card,
        }}
      >
        {footer}
      </View>
    </View>
  );
}

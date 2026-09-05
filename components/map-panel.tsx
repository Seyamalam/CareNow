import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";
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
  availableHeight,
  onHeightChange,
  inline = false,
}: {
  children: ReactNode;
  footer: ReactNode;
  wide: boolean;
  availableHeight: number;
  onHeightChange: (height: number) => void;
  inline?: boolean;
}) {
  const p = usePalette(),
    reduced = useReducedMotion(),
    travel = Math.min(140, availableHeight * 0.22),
    [expanded, setExpanded] = useState(false),
    offset = useSharedValue(travel),
    origin = useSharedValue(travel);
  const maximum = Math.min(560, Math.max(0, availableHeight - 64));
  useEffect(() => {
    onHeightChange(wide || inline ? 0 : maximum - (expanded ? 0 : travel));
    offset.set(
      withSpring(expanded ? 0 : travel, {
        duration: reduced ? 0 : 300,
        dampingRatio: 1,
      }),
    );
  }, [
    maximum,
    travel,
    wide,
    inline,
    expanded,
    reduced,
    onHeightChange,
    offset,
  ]);
  const snap = (up: boolean) => {
    setExpanded(up);
    offset.set(
      withSpring(up ? 0 : travel, {
        duration: reduced ? 0 : 300,
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
    height: maximum - offset.get(),
  }));
  if (wide || inline)
    return (
      <Card
        style={{ width: wide ? 400 : "100%", borderRadius: 0, flexShrink: 0 }}
      >
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
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
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
              style={{ height: 30, minHeight: 30, padding: 0, flexShrink: 0 }}
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
        <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
        <View style={{ flexShrink: 0, backgroundColor: p.card }}>{footer}</View>
      </Animated.View>
    </View>
  );
}

import { MotionArt } from "./motion-art";
import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { usePalette } from "../lib/theme";
import { Type } from "./ui";
export function BrandMark({
  size = 44,
  inverse = false,
}: {
  size?: number;
  inverse?: boolean;
}) {
  const p = usePalette();
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G fill={inverse ? p.accent : p.primary}>
        <Path d="M48 48C36 43 17 33 20 19C23 5 46 6 48 24Z" />
        <Path d="M52 52C64 57 83 67 80 81C77 95 54 94 52 76Z" />
      </G>
      <G fill={inverse ? p.onPrimary : p.soft}>
        <Path d="M52 48C57 36 67 17 81 20C95 23 94 46 76 48Z" />
        <Path d="M48 52C43 64 33 83 19 80C5 77 6 54 24 52Z" />
      </G>
    </Svg>
  );
}
export function Splash({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const p = usePalette();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: p.primary,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <View style={{ backgroundColor: p.card, borderRadius: 32 }}>
        <MotionArt kind="logo" size={112} />
      </View>
      <Type
        size={40}
        weight="bold"
        style={{ color: p.onPrimary, letterSpacing: -1.8 }}
      >
        CareNow
      </Type>
      <Type size={12} style={{ color: p.accent, letterSpacing: 4 }}>
        FAMILY CARE
      </Type>
      {error && (
        <View style={{ padding: 32, gap: 16 }}>
          <Type style={{ color: p.onPrimary, textAlign: "center" }}>
            {error}
          </Type>
          <Type
            onPress={onRetry}
            style={{
              color: p.accent,
              textAlign: "center",
              textDecorationLine: "underline",
            }}
          >
            Try again
          </Type>
        </View>
      )}
      <View style={{ position: "absolute", bottom: 64 }}>
        <Type size={10} style={{ color: p.accent, letterSpacing: 2 }}>
          BANGLADESH · EXHIBITION DEMO
        </Type>
      </View>
    </View>
  );
}

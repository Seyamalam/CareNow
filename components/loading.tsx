import { View } from "react-native";
import { Skeleton } from "panelui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import { usePalette } from "../lib/theme";
import { MotionArt } from "./motion-art";
export function LoadingScreen() {
  const p = usePalette(),
    insets = useSafeAreaInsets(),
    reduced = useReducedMotion();
  const Block = ({
    width,
    height,
  }: {
    width: number | string;
    height: number;
  }) =>
    reduced ? (
      <View
        style={{
          width: width as number,
          height,
          backgroundColor: p.muted,
          borderRadius: 16,
        }}
      />
    ) : (
      <View style={{ width: width as number, height }}>
        <Skeleton className="w-full h-full rounded-2xl" />
      </View>
    );
  return (
    <View
      accessibilityLabel="Loading CareNow"
      style={{
        flex: 1,
        backgroundColor: p.background,
        padding: 22,
        paddingTop: insets.top + 18,
        gap: 24,
      }}
    >
      <MotionArt kind="logo" size={60} />
      <Block width="65%" height={30} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1 }}>
            <Block width="100%" height={88} />
          </View>
        ))}
      </View>
      <Block width="40%" height={20} />
      <Block width="100%" height={142} />
      <Block width="45%" height={20} />
      <Block width="100%" height={142} />
    </View>
  );
}

import { useEffect, useState } from "react";
import { Keyboard, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Portal sheets need their own keyboard bounds, outside the screen's resize. */
export function useSheetLayout() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow",
      (event) => setKeyboardTop(event.endCoordinates.screenY),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardTop(null),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const bottom = keyboardTop === null ? 0 : Math.max(0, height - keyboardTop);
  return {
    keyboardVisible: bottom > 0,
    style: {
      width: "100%" as const,
      maxWidth: 640,
      alignSelf: "center" as const,
      bottom,
      height: Math.max(120, Math.min(680, height - bottom - insets.top - 16)),
    },
  };
}

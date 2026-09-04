import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useThemeMode } from 'panelui-native';

/**
 * The landing screen — the one you delete first.
 *
 * It says three things and stops: what this is, that it is running, and the
 * one command that adds the next thing. A starter that opens on a dashboard
 * of invented numbers looks impressive and teaches nothing, and every line of
 * it is a line to remove before any real work begins.
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { mode } = useThemeMode();

  return (
    <View
      className="flex-1 items-center justify-center gap-8 bg-background px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Two files rather than one tinted image: the mark carries a glow, and
          a glow does not survive being recoloured. */}
      <Image
        source={
          mode === 'dark'
            ? require('../../assets/logo-dark.png')
            : require('../../assets/logo-light.png')
        }
        style={{ width: 132, height: 132 }}
        resizeMode="contain"
        accessibilityLabel="PanelUI"
      />

      <View className="items-center gap-2">
        <Text size="3xl" weight="bold">
          PanelUI
        </Text>
        <Text muted className="text-center">
          Edit{' '}
          <Text muted className="font-mono">
            app/(tabs)/index.tsx
          </Text>{' '}
          and save to reload.
        </Text>
      </View>

      <View className="items-center gap-1">
        <Text size="sm" muted>
          Add a component
        </Text>
        <View className="rounded-xl border border-border bg-surface px-4 py-2.5">
          <Text size="sm" className="font-mono">
            npx panelui-cli@latest add dialog
          </Text>
        </View>
      </View>
    </View>
  );
}

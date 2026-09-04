import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Item, PANEL_THEMES, Switch, Text, useThemeMode } from 'panelui-native';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { family, mode, setFamily, toggleMode } = useThemeMode();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        paddingHorizontal: 16,
        gap: 24,
      }}
    >
      <View className="gap-1">
        <Text size="3xl" weight="bold">
          Settings
        </Text>
        <Text muted>Each family sets its own palette and its own corners.</Text>
      </View>

      <View className="gap-3">
        <Text size="sm" weight="medium" muted className="uppercase tracking-wider">
          Theme
        </Text>

        {/* Built from PANEL_THEMES rather than a hardcoded list, so a family
            you write yourself appears here as soon as it is registered. */}
        <View className="flex-row gap-4">
          {PANEL_THEMES.map((entry) => {
            const selected = entry.id === family.id;
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={entry.name}
                onPress={() => setFamily(entry.id)}
                className="items-center gap-2"
              >
                <View className={selected ? 'rounded-full border-2 border-ring p-0.5' : 'p-0.5'}>
                  <View
                    className="h-10 w-10 rounded-full border border-border"
                    style={{ backgroundColor: entry.swatch[mode === 'dark' ? 1 : 0] }}
                  />
                </View>
                <Text size="sm" muted={!selected}>
                  {entry.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card>
          {/* `toggleMode` keeps the current family, so someone in Moon dark
              who taps this lands in Moon light rather than default light. */}
          <Item>
            <Item.Content>
              <Item.Title>Dark mode</Item.Title>
              <Item.Description>Currently {mode}</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Switch
                value={mode === 'dark'}
                onValueChange={toggleMode}
                accessibilityLabel="Dark mode"
                accessibilityHint={`Currently ${mode}`}
              />
            </Item.Actions>
          </Item>
        </Card>
      </View>

    </ScrollView>
  );
}

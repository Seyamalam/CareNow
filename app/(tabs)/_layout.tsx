import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useCSSVariable } from 'uniwind';

/**
 * The tab bar, drawn by the platform.
 *
 * `NativeTabs` hands off to a real `UITabBar` on iOS and to a Material bottom
 * bar on Android, which is what makes it feel like part of the OS rather than
 * a row of views that resembles one — the scroll-edge behaviour, the minimise
 * on iOS 26, the long-press gestures and the accessibility all come with it.
 *
 * The cost is that the platform owns the drawing, so class names and theme
 * tokens do not reach it: every colour here has to be handed over as a value.
 * `useCSSVariable` is what turns a token into one, and it re-resolves on a
 * theme change, so the bar follows the theme like everything else.
 *
 * Icons are named per platform because each has its own catalogue — SF
 * Symbols on iOS, Material on Android. Naming both is what keeps the icon
 * native on each rather than the same drawing forced onto both.
 */
export default function TabsLayout() {
  const [tint, icon, background] = useCSSVariable([
    '--color-primary',
    '--color-muted-foreground',
    '--color-card',
  ]) as (string | undefined)[];

  return (
    <NativeTabs
      tintColor={tint}
      iconColor={icon}
      backgroundColor={background}
      labelStyle={{ color: icon }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="components">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
        <NativeTabs.Trigger.Label>Components</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

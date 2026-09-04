import React from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TextProps,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button, Card } from "panelui-native";
import Animated, {
  FadeInDown,
  FadeIn,
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Check,
  Heart,
  Flower2,
  Sparkles,
  Ambulance,
  Stethoscope,
  CalendarDays,
  FileText,
  Activity,
  UserRound,
  ShieldCheck,
  LucideIcon,
} from "lucide-react-native";
import { usePalette, type Palette } from "../lib/theme";
import { useCare } from "../lib/store";
export function Type({
  children,
  size = 15,
  weight = "regular",
  muted = false,
  style,
  ...props
}: TextProps & {
  size?: number;
  weight?: "regular" | "medium" | "bold";
  muted?: boolean;
}) {
  const p = usePalette();
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily:
            weight === "bold"
              ? "Manrope_700Bold"
              : weight === "medium"
                ? "DMSans_600SemiBold"
                : "DMSans_400Regular",
          fontSize: size,
          lineHeight: size * 1.42,
          color: muted ? p.subtle : p.ink,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 12 }, style]}
    >
      {children}
    </View>
  );
}
export function Box({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Card style={[{ borderRadius: 24, overflow: "hidden" }, style]}>
      <Card.Content style={{ padding: 20, gap: 14 }}>{children}</Card.Content>
    </Card>
  );
}
export function Enter({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={
        reduced
          ? undefined
          : FadeInDown.duration(420).delay(delay).springify().damping(22)
      }
      layout={LinearTransition.duration(reduced ? 0 : 220)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
export function Screen({
  children,
  title,
  subtitle,
  back = false,
  right,
  refresh = false,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  refresh?: boolean;
}) {
  const p = usePalette(),
    insets = useSafeAreaInsets();
  const care = useCare();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: p.background }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          refresh ? (
            <RefreshControl
              refreshing={false}
              onRefresh={care.refresh}
              tintColor={p.primary}
            />
          ) : undefined
        }
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
          gap: 24,
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
        }}
      >
        {(title || back) && (
          <Row style={{ justifyContent: "space-between" }}>
            <Row style={{ flex: 1 }}>
              {back && (
                <Button
                  size="icon"
                  variant="outline"
                  accessibilityLabel="Go back"
                  onPress={() =>
                    router.canGoBack() ? router.back() : router.replace("/")
                  }
                >
                  <ArrowLeft size={21} color={p.ink} />
                </Button>
              )}
              <View style={{ flex: 1 }}>
                {subtitle && (
                  <Type
                    muted
                    size={11}
                    weight="medium"
                    style={{
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {subtitle}
                  </Type>
                )}
                <Type size={back ? 25 : 31} weight="bold">
                  {title}
                </Type>
              </View>
            </Row>
            {right}
          </Row>
        )}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Type size={20} weight="bold">
        {title}
      </Type>
      {action && (
        <Button variant="ghost" size="sm" onPress={onPress}>
          {action}
        </Button>
      )}
    </Row>
  );
}
export function Pill({
  text,
  tone = "mint",
}: {
  text: string;
  tone?: "mint" | "rose" | "sand" | "lavender" | "muted" | "accent";
}) {
  const p = usePalette();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: p[tone],
      }}
    >
      <Type size={10} weight="medium">
        {text}
      </Type>
    </View>
  );
}
export function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant={selected ? "primary" : "outline"}
      size="sm"
      onPress={onPress}
      accessibilityState={{ selected }}
    >
      {label}
    </Button>
  );
}
export function Choices({
  values,
  value,
  onChange,
}: {
  values: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {values.map((x) => (
        <Choice
          key={x}
          label={x}
          selected={value === x}
          onPress={() => onChange(x)}
        />
      ))}
    </View>
  );
}
const icons: Record<string, LucideIcon> = {
  heart: Heart,
  flower: Flower2,
  sparkles: Sparkles,
  ambulance: Ambulance,
  doctor: Stethoscope,
  calendar: CalendarDays,
  record: FileText,
  activity: Activity,
  user: UserRound,
  shield: ShieldCheck,
};
export function IconTile({
  name,
  tone = "mint",
  size = 52,
}: {
  name: string;
  tone?: keyof Palette;
  size?: number;
}) {
  const p = usePalette(),
    Icon = icons[name] ?? Heart;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: p[tone],
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon size={size * 0.44} color={p.ink} strokeWidth={1.7} />
    </View>
  );
}
export function ListItem({
  icon,
  title,
  detail,
  onPress,
  tone = "mint",
  trailing,
}: {
  icon: string;
  title: string;
  detail?: string;
  onPress?: () => void;
  tone?: keyof Palette;
  trailing?: React.ReactNode;
}) {
  const p = usePalette();
  return (
    <Button
      variant="ghost"
      onPress={onPress}
      style={{
        height: "auto",
        paddingVertical: 8,
        paddingHorizontal: 0,
        justifyContent: "flex-start",
      }}
      accessibilityLabel={title}
    >
      <Row style={{ width: "100%" }}>
        <IconTile name={icon} tone={tone} />
        <View style={{ flex: 1, gap: 3 }}>
          <Type weight="medium">{title}</Type>
          {detail && (
            <Type size={12} muted>
              {detail}
            </Type>
          )}
        </View>
        {trailing ?? <ChevronRight size={18} color={p.subtle} />}
      </Row>
    </Button>
  );
}
export function Empty({
  title,
  detail,
  action,
  onPress,
}: {
  title: string;
  detail?: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Box>
      <View style={{ alignItems: "center", gap: 12, paddingVertical: 22 }}>
        <IconTile name="heart" size={60} />
        <Type size={20} weight="bold">
          {title}
        </Type>
        {detail && (
          <Type muted style={{ textAlign: "center" }}>
            {detail}
          </Type>
        )}
        {action && <Button onPress={onPress}>{action}</Button>}
      </View>
    </Box>
  );
}
export function PatientPicker() {
  const { state, memberId, selectMember } = useCare();
  return (
    <View style={{ gap: 10 }}>
      <Type size={13} weight="medium">
        Care for
      </Type>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {state?.members.map((m) => (
          <Choice
            key={m.id}
            label={m.name.split(" ")[0]}
            selected={memberId === m.id}
            onPress={() => selectMember(m.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
export function Success({
  title,
  detail,
  onPress,
  label = "View details",
}: {
  title: string;
  detail: string;
  onPress: () => void;
  label?: string;
}) {
  const p = usePalette();
  return (
    <Screen>
      <Enter>
        <View style={{ alignItems: "center", gap: 24, paddingTop: 90 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: p.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check color={p.primary} size={46} />
          </View>
          <Type size={32} weight="bold" style={{ textAlign: "center" }}>
            {title}
          </Type>
          <Type muted style={{ textAlign: "center" }}>
            {detail}
          </Type>
          <Button
            fullWidth
            size="lg"
            onPress={onPress}
            endContent={<ArrowUpRight size={18} />}
          >
            {label}
          </Button>
          <Pill text="DEMO · NO PAYMENT TAKEN" />
        </View>
      </Enter>
    </Screen>
  );
}
export function FloatingToast() {
  const { toast } = useCare();
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return toast ? (
    <Animated.View
      entering={FadeIn.duration(150)}
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: insets.bottom + 88,
        left: 24,
        right: 24,
        backgroundColor: p.primary,
        borderRadius: 18,
        padding: 16,
        maxWidth: 620,
        alignSelf: "center",
      }}
    >
      <Type style={{ color: p.onPrimary, textAlign: "center" }}>{toast}</Type>
    </Animated.View>
  ) : null;
}

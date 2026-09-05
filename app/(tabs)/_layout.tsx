import { Tabs } from "expo-router";
import {
  House,
  Stethoscope,
  Heart,
  CalendarDays,
  UserRound,
  Navigation,
} from "lucide-react-native";
import { usePalette } from "../../lib/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCare } from "../../lib/store";
export default function TabLayout() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useCare();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.primary,
        tabBarInactiveTintColor: p.subtle,
        tabBarStyle: {
          backgroundColor: p.card,
          borderTopColor: p.border,
          height: 62 + Math.max(insets.bottom, 12),
          paddingTop: 9,
          paddingBottom: Math.max(insets.bottom, 12),
        },
        tabBarLabelStyle: {
          fontFamily: "DMSans_600SemiBold",
          fontSize: 10,
          marginTop: 4,
        },
        tabBarLabelPosition: "below-icon",
        sceneStyle: { backgroundColor: p.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("Home", "হোম"),
          tabBarIcon: ({ color }) => <House size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: t("Doctors", "ডাক্তার"),
          tabBarIcon: ({ color }) => <Stethoscope size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: t("Care", "যত্ন"),
          tabBarIcon: ({ color }) => <Heart size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transport"
        options={{
          title: t("Rides", "যাতায়াত"),
          tabBarIcon: ({ color }) => <Navigation size={22} color={color} />,
        }}
      />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("Profile", "প্রোফাইল"),
          tabBarIcon: ({ color }) => <UserRound size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

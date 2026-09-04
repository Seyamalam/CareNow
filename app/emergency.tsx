import { View } from "react-native";
import { Button } from "panelui-native";
import { router } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { Screen, Type, Row, Box, Pill, IconTile } from "../components/ui";
import { usePalette } from "../lib/theme";
import { services } from "../shared/catalog";
import { money } from "../shared/contracts";
export default function Emergency() {
  const p = usePalette();
  return (
    <Screen
      back
      title="Emergency support"
      right={<Pill text="DEMO" tone="sand" />}
    >
      <View
        style={{
          backgroundColor: p.sand,
          borderRadius: 26,
          padding: 24,
          gap: 14,
        }}
      >
        <IconTile name="ambulance" tone="card" size={64} />
        <Type size={26} weight="bold">
          Transport & assistance
        </Type>
        <Type size={12}>Simulated requests · No real dispatch</Type>
      </View>
      {services
        .filter((s) => s.category === "emergency")
        .map((s) => (
          <Box key={s.id}>
            <Row>
              <View style={{ flex: 1, gap: 5 }}>
                <Type size={18} weight="bold">
                  {s.name}
                </Type>
                <Type size={12} muted>
                  {s.label}
                </Type>
                <Type size={13} weight="medium">
                  {money(s.rate)} / {s.unit}
                </Type>
              </View>
              <Button
                size="icon"
                variant="secondary"
                accessibilityLabel={`Request ${s.name}`}
                onPress={() =>
                  router.push({
                    pathname: "/service/[id]",
                    params: { id: s.id },
                  })
                }
              >
                <ArrowUpRight size={21} color={p.primary} />
              </Button>
            </Row>
          </Box>
        ))}
    </Screen>
  );
}

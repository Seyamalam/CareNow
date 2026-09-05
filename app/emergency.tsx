import { View } from "react-native";
import { Button } from "../components/button";
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
      <Button
        fullWidth
        size="lg"
        onPress={() =>
          router.push({ pathname: "/transport", params: { kind: "ambulance" } })
        }
        startContent={<ArrowUpRight size={20} />}
      >
        Book ambulance on map
      </Button>
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

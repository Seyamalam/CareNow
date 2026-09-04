import { View } from "react-native";
import { Button } from "../../components/button";
import { router, useLocalSearchParams } from "expo-router";
import { Check, ArrowRight } from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Pill,
  IconTile,
  Section,
  Empty,
} from "../../components/ui";
import { usePalette } from "../../lib/theme";
import { services, categories } from "../../shared/catalog";
import { money } from "../../shared/contracts";
export default function Service() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    p = usePalette();
  const s = services.find((x) => x.id === id),
    c = categories.find((x) => x.id === s?.category);
  if (!s || !c)
    return (
      <Screen back title="Care service">
        <Empty title="Service not found" />
      </Screen>
    );
  return (
    <Screen back title="Care details" right={<Pill text="DEMO" />}>
      <View
        style={{
          padding: 25,
          backgroundColor: p[c.tone],
          borderRadius: 28,
          gap: 20,
        }}
      >
        <IconTile name={c.icon} tone="card" size={66} />
        <View style={{ gap: 6 }}>
          <Type size={30} weight="bold">
            {s.name}
          </Type>
          <Type size={14}>{s.label}</Type>
        </View>
        <Row>
          <Pill text="DHAKA" tone="muted" />
          <Pill text="CHATTOGRAM" tone="muted" />
        </Row>
      </View>
      <Section title="Included care" />
      <Box>
        {s.features.map((f) => (
          <Row key={f} style={{ alignItems: "flex-start" }}>
            <Check size={18} color={p.primary} />
            <Type size={14} style={{ flex: 1 }}>
              {f}
            </Type>
          </Row>
        ))}
      </Box>
      {s.unit === "day" && (
        <>
          <Section title="Flexible schedules" />
          <Box>
            <Row style={{ justifyContent: "space-between" }}>
              <Type muted>Daily shift</Type>
              <Type weight="medium">8 · 12 · 24 hours</Type>
            </Row>
            <Row style={{ justifyContent: "space-between" }}>
              <Type muted>Care plan</Type>
              <Type weight="medium">7 · 15 · 30 days</Type>
            </Row>
          </Box>
        </>
      )}
      <Box>
        <Type size={11} muted>
          {s.unit === "day" ? "FROM · 8-HOUR SHIFT" : "ESTIMATED SERVICE FEE"}
        </Type>
        <Row style={{ alignItems: "baseline", gap: 6 }}>
          <Type size={32} weight="bold">
            {money(s.rate)}
          </Type>
          <Type muted>/ {s.unit}</Type>
        </Row>
        <Button
          fullWidth
          size="lg"
          onPress={() =>
            router.push({ pathname: "/request", params: { serviceId: s.id } })
          }
          endContent={<ArrowRight size={18} />}
        >
          Create care request
        </Button>
        <Type size={10} muted style={{ textAlign: "center" }}>
          Exhibition demo · No service will be dispatched
        </Type>
      </Box>
    </Screen>
  );
}

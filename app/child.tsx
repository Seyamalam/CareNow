import { View } from "react-native";
import { Button } from "panelui-native";
import { router } from "expo-router";
import { Check, ArrowUpRight, Sparkles } from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  PatientPicker,
  Section,
  Pill,
  IconTile,
} from "../components/ui";
import { usePalette } from "../lib/theme";
import { useCare } from "../lib/store";
import { routines } from "../shared/catalog";
import { today } from "../shared/contracts";
export default function Child() {
  const { state, memberId, act } = useCare(),
    p = usePalette();
  const completed = routines.filter((r) =>
    state!.logs.some(
      (l) =>
        l.memberId === memberId &&
        l.kind === "routine" &&
        l.value === r &&
        l.date.startsWith(today()),
    ),
  );
  return (
    <Screen
      back
      title="Child development"
      right={<Pill text="DEMO" tone="lavender" />}
    >
      <PatientPicker />
      <View
        style={{
          backgroundColor: p.lavender,
          borderRadius: 28,
          padding: 25,
          gap: 20,
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <Type size={11} weight="medium" style={{ letterSpacing: 1.5 }}>
            TODAY’S ROUTINE
          </Type>
          <Sparkles size={28} color={p.primary} />
        </Row>
        <Type size={42} weight="bold">
          {completed.length} <Type size={23}>/ {routines.length}</Type>
        </Type>
        <View style={{ height: 7, backgroundColor: p.card, borderRadius: 4 }}>
          <View
            style={{
              width: `${(completed.length / routines.length) * 100}%`,
              height: 7,
              borderRadius: 4,
              backgroundColor: p.primary,
            }}
          />
        </View>
        <Type size={12}>Activities completed</Type>
      </View>
      <Box>
        {routines.map((r, i) => (
          <Row key={r}>
            <IconTile
              name={i % 2 ? "sparkles" : "heart"}
              tone="lavender"
              size={40}
            />
            <Type style={{ flex: 1 }} size={14}>
              {r}
            </Type>
            <Button
              size="icon"
              variant={completed.includes(r) ? "primary" : "outline"}
              disabled={completed.includes(r)}
              accessibilityLabel={`Complete ${r}`}
              onPress={() =>
                void act({
                  type: "log.add",
                  memberId,
                  kind: "routine",
                  value: r,
                }).catch(() => {})
              }
            >
              <Check
                size={17}
                color={completed.includes(r) ? p.onPrimary : p.subtle}
              />
            </Button>
          </Row>
        ))}
      </Box>
      <Section title="Therapy & support" />
      {[
        {
          id: "speech",
          name: "Speech & language",
          detail: "Communication & expression",
        },
        {
          id: "occupational",
          name: "Occupational therapy",
          detail: "Daily skills & sensory activities",
        },
        {
          id: "behavioral",
          name: "Development & family support",
          detail: "Learning · Social skills · Parent coaching",
        },
        {
          id: "child-caregiver",
          name: "Specialized caregiver",
          detail: "Personal care & daily routines",
        },
        {
          id: "child-nurse",
          name: "Child nursing",
          detail: "Qualified nursing support",
        },
      ].map((s) => (
        <Box key={s.id}>
          <Row>
            <View style={{ flex: 1, gap: 5 }}>
              <Type weight="bold">{s.name}</Type>
              <Type size={12} muted>
                {s.detail}
              </Type>
            </View>
            <Button
              size="icon"
              variant="secondary"
              accessibilityLabel={`Explore ${s.name}`}
              onPress={() =>
                router.push({ pathname: "/service/[id]", params: { id: s.id } })
              }
            >
              <ArrowUpRight size={20} color={p.ink} />
            </Button>
          </Row>
        </Box>
      ))}
    </Screen>
  );
}

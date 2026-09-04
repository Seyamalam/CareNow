import { useState } from "react";
import { View } from "react-native";
import { Button, Input } from "panelui-native";
import { router } from "expo-router";
import { Plus, Flower2, Check, ArrowUpRight } from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Section,
  Choices,
  PatientPicker,
  Pill,
  IconTile,
  Empty,
} from "../components/ui";
import { usePalette } from "../lib/theme";
import { useCare } from "../lib/store";
import { today } from "../shared/contracts";
export default function Motherhood() {
  const p = usePalette(),
    { state, memberId, act, pending, notify } = useCare();
  const [tab, setTab] = useState("Overview");
  const [kind, setKind] = useState<"symptom" | "weight" | "movement">(
    "symptom",
  );
  const [value, setValue] = useState("");
  const logs = state!.logs.filter(
    (l) => l.memberId === memberId && l.kind !== "routine",
  );
  const weeks = 24;
  async function save() {
    try {
      await act({ type: "log.add", memberId, kind, value });
      setValue("");
      notify("Journal entry saved");
    } catch {}
  }
  return (
    <Screen back title="Motherhood" right={<Pill text="DEMO" tone="rose" />}>
      <PatientPicker />
      <Choices
        values={["Overview", "Journal", "Postpartum"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Overview" ? (
        <>
          <View
            style={{
              backgroundColor: p.rose,
              borderRadius: 28,
              padding: 26,
              gap: 21,
            }}
          >
            <Row style={{ justifyContent: "space-between" }}>
              <Type size={10} weight="medium" style={{ letterSpacing: 1.5 }}>
                PREGNANCY TIMELINE
              </Type>
              <Flower2 size={27} color={p.primary} />
            </Row>
            <Row style={{ alignItems: "baseline", gap: 8 }}>
              <Type size={58} weight="bold" style={{ letterSpacing: -2 }}>
                24
              </Type>
              <Type size={22}>weeks</Type>
              <View style={{ flex: 1 }} />
              <Pill text="TRIMESTER 2" tone="muted" />
            </Row>
            <View
              style={{
                height: 6,
                backgroundColor: p.card,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${(weeks / 40) * 100}%`,
                  height: "100%",
                  backgroundColor: p.primary,
                  borderRadius: 3,
                }}
              />
            </View>
            <Row style={{ justifyContent: "space-between" }}>
              <Type size={11}>Week 1</Type>
              <Type size={11}>Week 40</Type>
            </Row>
            <Type size={10} muted>
              Illustrative timeline · Set with a clinician for real care
            </Type>
          </View>
          <Section title="Today’s checklist" />
          <Box>
            {[
              "Prenatal supplement",
              "Hydration log",
              "Next screening reminder",
            ].map((item, i) => {
              const key = `prenatal:${item}`;
              const done = state!.logs.some(
                (l) =>
                  l.memberId === memberId &&
                  l.kind === "symptom" &&
                  l.value === key &&
                  l.date.startsWith(today()),
              );
              return (
                <Row key={item}>
                  <IconTile
                    name={i === 2 ? "calendar" : "flower"}
                    tone="rose"
                    size={40}
                  />
                  <Type style={{ flex: 1 }} size={14}>
                    {item}
                  </Type>
                  <Button
                    size="icon"
                    variant={done ? "primary" : "outline"}
                    disabled={done}
                    accessibilityLabel={item}
                    onPress={() =>
                      void act({
                        type: "log.add",
                        memberId,
                        kind: "symptom",
                        value: key,
                      }).catch(() => {})
                    }
                  >
                    <Check size={16} color={done ? p.onPrimary : p.subtle} />
                  </Button>
                </Row>
              );
            })}
          </Box>
          <Button fullWidth variant="outline" onPress={() => setTab("Journal")}>
            Add a journal entry
          </Button>
          <Section title="Prenatal support" />
          <Box>
            <Type weight="bold">Nursing & daily care</Type>
            <Row>
              <Button
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/service/[id]",
                    params: { id: "prenatal-nurse" },
                  })
                }
              >
                Home nursing
              </Button>
              <Button
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: "/book",
                    params: { doctorId: "dr-samira" },
                  })
                }
              >
                Book doctor
              </Button>
            </Row>
          </Box>
        </>
      ) : tab === "Journal" ? (
        <>
          <Box>
            <Choices
              values={["Symptoms", "Weight", "Movement"]}
              value={
                kind === "symptom"
                  ? "Symptoms"
                  : kind === "weight"
                    ? "Weight"
                    : "Movement"
              }
              onChange={(v) => {
                setKind(
                  v === "Symptoms"
                    ? "symptom"
                    : v === "Weight"
                      ? "weight"
                      : "movement",
                );
                setValue("");
              }}
            />
            <Input
              label={
                kind === "weight"
                  ? "Weight (kg)"
                  : kind === "movement"
                    ? "Movement count"
                    : "How are you feeling?"
              }
              value={value}
              onChangeText={setValue}
              keyboardType={kind === "symptom" ? "default" : "decimal-pad"}
              multiline={kind === "symptom"}
              placeholder={
                kind === "weight"
                  ? "62.5"
                  : kind === "movement"
                    ? "0"
                    : "Add a note"
              }
            />
            {kind === "movement" && (
              <Type size={11} muted>
                Use only when your clinician recommends tracking. This log does
                not assess wellbeing.
              </Type>
            )}
            <Button
              fullWidth
              loading={pending}
              disabled={!value.trim()}
              onPress={save}
              startContent={<Plus size={17} />}
            >
              Save entry
            </Button>
          </Box>
          {logs.filter((l) => !l.value.startsWith("prenatal:")).length ? (
            logs
              .filter((l) => !l.value.startsWith("prenatal:"))
              .map((l) => (
                <Box key={l.id}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Pill text={l.kind.toUpperCase()} tone="rose" />
                    <Type size={10} muted>
                      {new Date(l.date).toLocaleDateString("en-GB")}
                    </Type>
                  </Row>
                  <Type
                    size={l.kind === "symptom" ? 16 : 30}
                    weight={l.kind === "symptom" ? "regular" : "bold"}
                  >
                    {l.value}
                    {l.kind === "weight"
                      ? " kg"
                      : l.kind === "movement"
                        ? " movements"
                        : ""}
                  </Type>
                </Box>
              ))
          ) : (
            <Empty
              title="Your journal is ready"
              detail="Your entries will appear here."
            />
          )}
        </>
      ) : (
        <>
          {[
            {
              id: "postpartum",
              title: "Postpartum care",
              detail: "Recovery · Nutrition · Wellbeing",
            },
            {
              id: "nanny",
              title: "Newborn nanny",
              detail: "Feeding · Hygiene · Sleep",
            },
            {
              id: "toddler",
              title: "Toddler caregiver",
              detail: "Daily routines · Creative play",
            },
          ].map((s) => (
            <Box key={s.id}>
              <IconTile name="flower" tone="rose" />
              <Type size={22} weight="bold">
                {s.title}
              </Type>
              <Type size={12} muted>
                {s.detail}
              </Type>
              <Button
                fullWidth
                variant="secondary"
                endContent={<ArrowUpRight size={17} />}
                onPress={() =>
                  router.push({
                    pathname: "/service/[id]",
                    params: { id: s.id },
                  })
                }
              >
                Explore care
              </Button>
            </Box>
          ))}
        </>
      )}
    </Screen>
  );
}

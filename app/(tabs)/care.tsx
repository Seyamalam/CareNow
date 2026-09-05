import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Button } from "../../components/button";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowUpRight, ChevronRight } from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Choice,
  Enter,
  IconTile,
  Pill,
  Section,
} from "../../components/ui";
import { usePalette } from "../../lib/theme";
import { useCare } from "../../lib/store";
import { categories, services } from "../../shared/catalog";
import { money } from "../../shared/contracts";
export default function Care() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [selected, setSelected] = useState("all");
  const category = params.category ?? selected;
  const p = usePalette(),
    { t } = useCare();
  function choose(c: string) {
    setSelected(c);
    router.setParams({ category: c });
  }
  return (
    <Screen
      title={t("Care services", "যত্ন সেবা")}
      subtitle="AT HOME · WITH YOU"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <Choice
          label="All care"
          selected={category === "all"}
          onPress={() => choose("all")}
        />
        {categories.map((c) => (
          <Choice
            key={c.id}
            label={c.name}
            selected={category === c.id}
            onPress={() => choose(c.id)}
          />
        ))}
      </ScrollView>
      {(category === "all" || category === "motherhood") && (
        <Enter>
          <Button
            variant="ghost"
            onPress={() => router.push("/motherhood")}
            style={{ height: "auto", padding: 0 }}
          >
            <View
              style={{
                backgroundColor: p.rose,
                borderRadius: 26,
                padding: 22,
                width: "100%",
                gap: 14,
              }}
            >
              <Row style={{ justifyContent: "space-between" }}>
                <IconTile name="flower" tone="card" />
                <ArrowUpRight size={22} color={p.ink} />
              </Row>
              <Type size={23} weight="bold">
                Motherhood journal
              </Type>
              <Type size={12}>Timeline · Daily logs · Care reminders</Type>
            </View>
          </Button>
        </Enter>
      )}
      {(category === "all" || category === "children") && (
        <Button
          variant="outline"
          onPress={() => router.push("/child")}
          style={{ height: "auto", padding: 18, borderRadius: 22 }}
        >
          <Row style={{ width: "100%" }}>
            <IconTile name="sparkles" tone="lavender" />
            <View style={{ flex: 1 }}>
              <Type weight="bold">Child development</Type>
              <Type size={12} muted>
                Routines & therapy
              </Type>
            </View>
            <ChevronRight size={18} color={p.ink} />
          </Row>
        </Button>
      )}
      <Section
        title={
          category === "all"
            ? "Explore services"
            : (categories.find((c) => c.id === category)?.name ?? "Services")
        }
      />
      {services
        .filter((s) => category === "all" || s.category === category)
        .map((s, i) => {
          const c = categories.find((c) => c.id === s.category)!;
          return (
            <Enter key={s.id} delay={Math.min(i * 25, 150)}>
              <Box>
                <Row>
                  <IconTile name={c.icon} tone={c.tone} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Type size={16} weight="bold">
                      {s.name}
                    </Type>
                    <Type size={12} muted>
                      {s.label}
                    </Type>
                  </View>
                </Row>
                <Row style={{ justifyContent: "space-between" }}>
                  <Type size={17} weight="bold">
                    {s.id === "ambulance" ? "Route-based fare" : money(s.rate)}{" "}
                    {s.id !== "ambulance" && (
                      <Type muted size={11}>
                        / {s.unit}
                      </Type>
                    )}
                  </Type>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: "/service/[id]",
                        params: { id: s.id },
                      })
                    }
                    endContent={<ArrowUpRight size={15} />}
                  >
                    Explore
                  </Button>
                </Row>
              </Box>
            </Enter>
          );
        })}
    </Screen>
  );
}

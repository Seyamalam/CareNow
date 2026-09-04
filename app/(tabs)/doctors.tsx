import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Input, Button } from "panelui-native";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen, Type, Row, Choice, Enter, Empty } from "../../components/ui";
import { DoctorCard } from "../../components/doctor-card";
import { doctors, specialties } from "../../shared/catalog";
import { useCare } from "../../lib/store";
import { usePalette } from "../../lib/theme";
export default function Doctors() {
  const params = useLocalSearchParams<{ specialty?: string }>();
  const [specialty, setSpecialty] = useState(params.specialty ?? "All");
  const [search, setSearch] = useState("");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState(false);
  const p = usePalette(),
    { t } = useCare();
  const list = doctors
    .filter(
      (d) =>
        (specialty === "All" || d.specialty === specialty) &&
        (!available || d.available) &&
        `${d.name} ${d.specialty}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (sort ? a.fee - b.fee : b.rating - a.rating));
  return (
    <Screen
      title={t("Find a doctor", "ডাক্তার খুঁজুন")}
      subtitle="CONSULTATIONS"
    >
      <Input
        placeholder="Name or specialty"
        value={search}
        onChangeText={setSearch}
        startContent={<Search size={18} color={p.subtle} />}
        size="lg"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {specialties.map((s) => (
          <Choice
            key={s}
            label={s}
            selected={s === specialty}
            onPress={() => setSpecialty(s)}
          />
        ))}
      </ScrollView>
      <Row style={{ justifyContent: "space-between" }}>
        <Choice
          label="Available today"
          selected={available}
          onPress={() => setAvailable(!available)}
        />
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setSort(!sort)}
          startContent={<SlidersHorizontal size={15} />}
        >
          {sort ? "Lowest fee" : "Top rated"}
        </Button>
      </Row>
      <Row style={{ justifyContent: "space-between" }}>
        <Type size={12} muted>
          {list.length} specialists
        </Type>
        <Type size={10} muted>
          DEMO PROFILES
        </Type>
      </Row>
      {list.length ? (
        list.map((d, i) => (
          <Enter key={d.id} delay={i * 35}>
            <DoctorCard doctor={d} />
          </Enter>
        ))
      ) : (
        <Empty
          title="No matching doctors"
          detail="Try another specialty or search."
          action="Clear filters"
          onPress={() => {
            setSearch("");
            setSpecialty("All");
            setAvailable(false);
          }}
        />
      )}
    </Screen>
  );
}

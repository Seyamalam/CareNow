import { View } from "react-native";
import { Button } from "../../components/button";
import { router, useLocalSearchParams } from "expo-router";
import { BadgeCheck, Star, Video, Languages, Check } from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Pill,
  Section,
  Empty,
} from "../../components/ui";
import { DoctorAvatar } from "../../components/doctor-card";
import { usePalette } from "../../lib/theme";
import { doctors } from "../../shared/catalog";
import { money } from "../../shared/contracts";
export default function Doctor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = doctors.find((x) => x.id === id),
    p = usePalette();
  if (!d)
    return (
      <Screen back title="Doctor">
        <Empty title="Doctor not found" />
      </Screen>
    );
  return (
    <Screen back title="Doctor profile" right={<Pill text="DEMO" />}>
      <View style={{ alignItems: "center", gap: 13, paddingTop: 10 }}>
        <DoctorAvatar doctor={d} size={112} />
        <View style={{ alignItems: "center", gap: 5 }}>
          <Type size={25} weight="bold">
            {d.name}
          </Type>
          <Type muted size={14}>
            {d.specialty}
          </Type>
          <Type muted size={12}>
            {d.qualification}
          </Type>
        </View>
        <Pill
          text={d.available ? "AVAILABLE TODAY" : "NEXT AVAILABLE TOMORROW"}
        />
      </View>
      <Box>
        <Row style={{ justifyContent: "space-around" }}>
          {[
            { value: `${d.experience}+`, label: "Years of care" },
            { value: String(d.rating), label: "Patient rating" },
            { value: `${d.reviews}`, label: "Reviews" },
          ].map((x) => (
            <View key={x.label} style={{ alignItems: "center", gap: 4 }}>
              <Type size={23} weight="bold">
                {x.value}
              </Type>
              <Type size={10} muted>
                {x.label}
              </Type>
            </View>
          ))}
        </Row>
      </Box>
      <Section title="Consultation details" />
      <Box>
        <Row>
          <Languages size={20} color={p.primary} />
          <Type>{d.languages}</Type>
        </Row>
        <Row>
          <Video size={20} color={p.primary} />
          <Type>Video or audio · 20 minutes</Type>
        </Row>
        <Row>
          <BadgeCheck size={20} color={p.primary} />
          <Type>Fictional exhibition profile</Type>
        </Row>
      </Box>
      <Section title="Areas of care" />
      <View style={{ gap: 12 }}>
        {d.focus.map((f) => (
          <Row key={f}>
            <Check size={17} color={p.primary} />
            <Type size={14}>{f}</Type>
          </Row>
        ))}
      </View>
      <Box>
        <Row style={{ justifyContent: "space-between" }}>
          <View>
            <Type size={11} muted>
              CONSULTATION FEE
            </Type>
            <Type size={29} weight="bold">
              {money(d.fee)}
            </Type>
          </View>
          <Pill text="20 MIN" tone="sand" />
        </Row>
        <Button
          fullWidth
          size="lg"
          onPress={() =>
            router.push({ pathname: "/book", params: { doctorId: d.id } })
          }
        >
          Choose a time
        </Button>
      </Box>
    </Screen>
  );
}

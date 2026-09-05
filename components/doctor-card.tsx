import { View } from "react-native";
import { Button } from "../components/button";
import { router } from "expo-router";
import { ArrowUpRight, Star } from "lucide-react-native";
import { type Doctor } from "../shared/catalog";
import { money } from "../shared/contracts";
import { usePalette } from "../lib/theme";
import { Box, Type, Row, Pill } from "./ui";
export function DoctorAvatar({
  doctor,
  size = 66,
}: {
  doctor: Doctor;
  size?: number;
}) {
  const p = usePalette();
  const tone =
    doctor.tone === "rose"
      ? p.rose
      : doctor.tone === "sand"
        ? p.sand
        : doctor.tone === "lavender"
          ? p.lavender
          : p.mint;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: tone,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Type size={size * 0.29} weight="bold">
        {doctor.initials}
      </Type>
      <View
        style={{
          position: "absolute",
          right: size * 0.1,
          bottom: size * 0.1,
          width: 11,
          height: 11,
          borderRadius: 6,
          backgroundColor: doctor.available ? p.primary : p.subtle,
          borderWidth: 2,
          borderColor: p.card,
        }}
      />
    </View>
  );
}
export function DoctorCard({
  doctor,
  compact = false,
}: {
  doctor: Doctor;
  compact?: boolean;
}) {
  const p = usePalette();
  return (
    <Box>
      <Row>
        <DoctorAvatar doctor={doctor} />
        <View style={{ flex: 1, gap: 3 }}>
          <Type size={16} weight="bold">
            {doctor.name}
          </Type>
          <Type size={12} muted>
            {doctor.specialty}
          </Type>
          <Row style={{ gap: 5 }}>
            <Star size={11} color={p.primary} fill={p.accent} />
            <Type size={11} weight="medium">
              {doctor.rating}{" "}
              <Type size={11} muted>
                ({doctor.reviews}) · {doctor.experience} yrs
              </Type>
            </Type>
          </Row>
        </View>
      </Row>
      <Row
        style={{
          justifyContent: "space-between",
          paddingTop: 2,
          flexWrap: "wrap",
        }}
      >
        <Type size={18} weight="bold">
          {money(doctor.fee)}{" "}
          <Type size={11} muted>
            / visit
          </Type>
        </Type>
        <Button
          variant={compact ? "secondary" : "primary"}
          size="sm"
          onPress={() =>
            router.push({ pathname: "/doctor/[id]", params: { id: doctor.id } })
          }
          endContent={<ArrowUpRight size={15} />}
        >
          {compact ? "View profile" : "Book visit"}
        </Button>
      </Row>
    </Box>
  );
}

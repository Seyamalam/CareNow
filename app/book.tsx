import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button, Input } from "panelui-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Screen,
  Type,
  Row,
  Box,
  Choices,
  Choice,
  PatientPicker,
  Success,
  Empty,
  Pill,
} from "../components/ui";
import { DoctorAvatar } from "../components/doctor-card";
import { useCare } from "../lib/store";
import { doctors, slots } from "../shared/catalog";
import { today, shortDate, money } from "../shared/contracts";
export default function Book() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const doctor = doctors.find((d) => d.id === doctorId);
  const { state, memberId, act, pending, t } = useCare();
  const [date, setDate] = useState(today(1));
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<"Video" | "Audio">("Video");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [error, setError] = useState("");
  if (!doctor)
    return (
      <Screen back title="Book a visit">
        <Empty
          title="Choose a doctor first"
          action="Find a doctor"
          onPress={() => router.replace("/doctors")}
        />
      </Screen>
    );
  if (confirmed)
    return (
      <Success
        title="Visit confirmed"
        detail={`${doctor.name}\n${shortDate(date)} · ${time}`}
        onPress={() =>
          router.replace({
            pathname: "/appointment/[id]",
            params: { id: confirmed },
          })
        }
      />
    );
  async function book() {
    if (!time) {
      setError("Choose a time slot");
      return;
    }
    try {
      const s = await act({
        type: "appointment.book",
        memberId,
        doctorId: doctor!.id,
        date,
        time,
        mode,
        note,
      });
      setConfirmed(s.appointments[0].id);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Screen
      back
      title={t("Book a visit", "ভিজিট বুক করুন")}
      right={<Pill text="DEMO" />}
    >
      <Box>
        <Row>
          <DoctorAvatar doctor={doctor} size={54} />
          <View>
            <Type weight="bold">{doctor.name}</Type>
            <Type muted size={12}>
              {doctor.specialty}
            </Type>
          </View>
        </Row>
      </Box>
      <PatientPicker />
      <View style={{ gap: 12 }}>
        <Type weight="medium">Choose a day</Type>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {Array.from({ length: 14 }, (_, i) => today(i + 1)).map((d) => (
            <Choice
              key={d}
              label={shortDate(d)}
              selected={date === d}
              onPress={() => {
                setDate(d);
                setTime("");
              }}
            />
          ))}
        </ScrollView>
      </View>
      <View style={{ gap: 12 }}>
        <Type weight="medium">Available times</Type>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {slots.map((s) => {
            const booked = state!.appointments.some(
              (a) =>
                a.doctorId === doctor.id &&
                a.date === date &&
                a.time === s &&
                a.status === "Confirmed",
            );
            return (
              <Button
                key={s}
                variant={s === time ? "primary" : "outline"}
                size="sm"
                disabled={booked}
                onPress={() => {
                  setTime(s);
                  setError("");
                }}
              >
                {s}
              </Button>
            );
          })}
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <Type weight="medium">Consultation mode</Type>
        <Choices
          values={["Video", "Audio"]}
          value={mode}
          onChange={(s) => setMode(s === "Video" ? "Video" : "Audio")}
        />
      </View>
      <Input
        label="Visit notes (optional)"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Reason for your visit"
      />
      <Box>
        <Row style={{ justifyContent: "space-between" }}>
          <Type muted>Consultation</Type>
          <Type weight="bold">{money(doctor.fee)}</Type>
        </Row>
        <Row style={{ justifyContent: "space-between" }}>
          <Type muted>Platform fee</Type>
          <Type>৳0</Type>
        </Row>
        <Row style={{ justifyContent: "space-between" }}>
          <Type size={19} weight="bold">
            Total
          </Type>
          <Type size={24} weight="bold">
            {money(doctor.fee)}
          </Type>
        </Row>
        <Pill text="DEMO · NO PAYMENT REQUIRED" />
      </Box>
      {error && <Type selectable>{error}</Type>}
      <Button fullWidth size="lg" loading={pending} onPress={book}>
        {t("Confirm appointment", "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন")}
      </Button>
    </Screen>
  );
}

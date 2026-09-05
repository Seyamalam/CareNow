import { useState } from "react";
import { View } from "react-native";
import { Button } from "../../components/button";
import { router, useLocalSearchParams } from "expo-router";
import {
  Video,
  MessageCircle,
  CalendarDays,
  Clock3,
  UserRound,
} from "lucide-react-native";
import { Screen, Type, Row, Box, Pill, Empty } from "../../components/ui";
import { Confirm } from "../../components/confirm";
import { DoctorAvatar } from "../../components/doctor-card";
import { usePalette } from "../../lib/theme";
import { useCare } from "../../lib/store";
import { doctors } from "../../shared/catalog";
import { shortDate, money } from "../../shared/contracts";
export default function Appointment() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { state, act, pending } = useCare(),
    p = usePalette();
  const [cancel, setCancel] = useState(false);
  const a = state!.appointments.find((x) => x.id === id),
    doctor = doctors.find((d) => d.id === a?.doctorId);
  if (!a || !doctor)
    return (
      <Screen back title="Appointment">
        <Empty title="Appointment not found" />
      </Screen>
    );
  return (
    <Screen back title="Your appointment" right={<Pill text="DEMO" />}>
      <Pill
        text={a.status.toUpperCase()}
        tone={a.status === "Cancelled" ? "rose" : "mint"}
      />
      <Box>
        <Row>
          <DoctorAvatar doctor={doctor} />
          <View style={{ flex: 1, gap: 4 }}>
            <Type size={18} weight="bold">
              {doctor.name}
            </Type>
            <Type size={13} muted>
              {doctor.specialty}
            </Type>
          </View>
        </Row>
        <Row>
          <CalendarDays size={17} color={p.primary} />
          <Type>{shortDate(a.date)}</Type>
          <Clock3 size={17} color={p.primary} />
          <Type>{a.time}</Type>
        </Row>
        <Row>
          <UserRound size={17} color={p.primary} />
          <Type>{state!.members.find((m) => m.id === a.memberId)?.name}</Type>
        </Row>
        <Row>
          <Video size={17} color={p.primary} />
          <Type>{a.mode} consultation · 20 min</Type>
        </Row>
      </Box>
      {!!a.note && (
        <Box>
          <Type size={12} muted>
            VISIT NOTES
          </Type>
          <Type>{a.note}</Type>
        </Box>
      )}
      <Box>
        <Row style={{ justifyContent: "space-between" }}>
          <Type muted>Consultation fee</Type>
          <Type size={23} weight="bold">
            {money(a.fee)}
          </Type>
        </Row>
        <Type size={11} muted>
          Demo booking · No payment taken
        </Type>
      </Box>
      {a.status === "Confirmed" ? (
        <>
          <Button
            fullWidth
            size="lg"
            startContent={<Video size={19} />}
            onPress={() =>
              router.push({ pathname: "/consult/[id]", params: { id: a.id } })
            }
          >
            Open consultation
          </Button>
          <Button
            fullWidth
            variant="outline"
            startContent={<MessageCircle size={18} />}
            onPress={() =>
              router.push({
                pathname: "/consult/[id]",
                params: { id: a.id, tab: "chat" },
              })
            }
          >
            Message care team
          </Button>
          <Button variant="ghost" onPress={() => setCancel(true)}>
            Cancel appointment
          </Button>
        </>
      ) : a.status === "Completed" ? (
        <Button fullWidth onPress={() => router.push("/records")}>
          View consultation summary
        </Button>
      ) : (
        <Button
          fullWidth
          onPress={() =>
            router.push({ pathname: "/book", params: { doctorId: a.doctorId } })
          }
        >
          Book another visit
        </Button>
      )}
      <Confirm
        open={cancel}
        setOpen={setCancel}
        title="Cancel this appointment?"
        detail={`${doctor.name} · ${shortDate(a.date)}, ${a.time}`}
        loading={pending}
        label="Cancel appointment"
        onConfirm={() =>
          void act({
            type: "appointment.status",
            id: a.id,
            status: "Cancelled",
          })
            .then(() => setCancel(false))
            .catch(() => {})
        }
      />
    </Screen>
  );
}

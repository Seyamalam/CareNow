import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button } from "panelui-native";
import { router } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Choices,
  Pill,
  IconTile,
  Empty,
  Enter,
} from "../../components/ui";
import { useCare } from "../../lib/store";
import { doctors, services } from "../../shared/catalog";
import { shortDate, money } from "../../shared/contracts";
export default function Activity() {
  const { state, t } = useCare();
  const [filter, setFilter] = useState("Upcoming");
  const appointments = state!.appointments.filter(
    (a) =>
      filter === "All" ||
      (filter === "Upcoming"
        ? a.status === "Confirmed"
        : a.status !== "Confirmed"),
  );
  const requests = state!.requests.filter(
    (r) =>
      filter === "All" ||
      (filter === "Upcoming"
        ? !["Cancelled", "Completed"].includes(r.status)
        : ["Cancelled", "Completed"].includes(r.status)),
  );
  return (
    <Screen
      refresh
      title={t("Your activity", "আপনার কার্যক্রম")}
      subtitle="APPOINTMENTS & CARE"
    >
      <Choices
        values={["Upcoming", "Past", "All"]}
        value={filter}
        onChange={setFilter}
      />
      {!appointments.length && !requests.length && (
        <Empty
          title="No care scheduled"
          detail="Your appointments and requests appear here."
          action="Explore care"
          onPress={() => router.push("/care")}
        />
      )}{" "}
      {appointments.map((a) => {
        const doctor = doctors.find((d) => d.id === a.doctorId);
        return (
          <Enter key={a.id}>
            <Box>
              <Row style={{ justifyContent: "space-between" }}>
                <Pill
                  text={a.status.toUpperCase()}
                  tone={a.status === "Cancelled" ? "rose" : "mint"}
                />
                <Type size={11} muted>
                  {a.mode} visit
                </Type>
              </Row>
              <Row>
                <IconTile name="doctor" />
                <View style={{ flex: 1, gap: 4 }}>
                  <Type weight="bold">{doctor?.name}</Type>
                  <Type size={12} muted>
                    {state!.members.find((m) => m.id === a.memberId)?.name}
                  </Type>
                </View>
              </Row>
              <Row style={{ justifyContent: "space-between" }}>
                <Type size={12}>
                  {shortDate(a.date)} · {a.time}
                </Type>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() =>
                    router.push({
                      pathname: "/appointment/[id]",
                      params: { id: a.id },
                    })
                  }
                  endContent={<ArrowUpRight size={15} />}
                >
                  Details
                </Button>
              </Row>
            </Box>
          </Enter>
        );
      })}
      {requests.map((r) => (
        <Enter key={r.id}>
          <Box>
            <Row style={{ justifyContent: "space-between" }}>
              <Pill
                text={r.status.toUpperCase()}
                tone={r.status === "Cancelled" ? "rose" : "sand"}
              />
              <Type size={11} muted>
                {r.emergency ? "Emergency support" : "Home care"}
              </Type>
            </Row>
            <Type size={18} weight="bold">
              {services.find((s) => s.id === r.serviceId)?.name}
            </Type>
            <Type muted size={12}>
              {r.city} · {shortDate(r.startDate)}
            </Type>
            <Row style={{ justifyContent: "space-between" }}>
              <Type weight="bold">{money(r.price)}</Type>
              <Button
                variant="secondary"
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: "/request/[id]",
                    params: { id: r.id },
                  })
                }
                endContent={<ArrowUpRight size={15} />}
              >
                Track care
              </Button>
            </Row>
          </Box>
        </Enter>
      ))}
    </Screen>
  );
}

import { AccountSwitcher } from "../../components/account-switcher";
import { View, ScrollView } from "react-native";
import { Redirect, router } from "expo-router";
import {
  Bell,
  ArrowRight,
  ChevronRight,
  Clock3,
  Plus,
  Check,
  MapPin,
  Stethoscope,
  HeartHandshake,
  Navigation,
  FileText,
  CalendarDays,
} from "lucide-react-native";
import { Button } from "../../components/button";
import {
  Screen,
  Type,
  Row,
  Box,
  Section,
  Enter,
  Pill,
  IconTile,
} from "../../components/ui";
import { BrandMark } from "../../components/brand";
import { DoctorAvatar, DoctorCard } from "../../components/doctor-card";
import { VehicleArt } from "../../components/vehicle-art";
import { useCare } from "../../lib/store";
import { usePalette } from "../../lib/theme";
import { doctors, medications } from "../../shared/catalog";
import { today, shortDate } from "../../shared/contracts";
export default function Home() {
  const p = usePalette(),
    { state, memberId, selectMember, act, t } = useCare();
  if (state!.workspace.role !== "customer")
    return <Redirect href="/workspace" />;
  const member =
      state!.members.find((m) => m.id === memberId) ?? state!.members[0],
    upcoming = state!.appointments.find(
      (a) => a.status === "Confirmed" && a.memberId === memberId,
    ),
    doctor = doctors.find((d) => d.id === upcoming?.doctorId);
  const care = state!.requests.find(
      (r) => !["Completed", "Cancelled"].includes(r.status),
    ),
    trip = state!.trips.find(
      (t) => !["Completed", "Cancelled"].includes(t.status),
    );
  const actions = [
    {
      label: t("Doctors", "ডাক্তার"),
      detail: "Video & audio",
      icon: Stethoscope,
      href: "/doctors" as const,
      tone: p.mint,
    },
    {
      label: t("Home care", "হোম কেয়ার"),
      detail: "Nursing & support",
      icon: HeartHandshake,
      href: "/care" as const,
      tone: p.rose,
    },
    {
      label: t("Transport", "যাতায়াত"),
      detail: "Ambulance & more",
      icon: Navigation,
      href: "/transport" as const,
      tone: p.sand,
    },
    {
      label: t("Health records", "স্বাস্থ্য রেকর্ড"),
      detail: "Reports & visits",
      icon: FileText,
      href: "/records" as const,
      tone: p.lavender,
    },
  ];
  return (
    <Screen refresh>
      <Enter>
        <Row style={{ justifyContent: "space-between" }}>
          <Row style={{ gap: 7 }}>
            <BrandMark size={29} />
            <Type size={22} weight="bold" style={{ letterSpacing: -0.8 }}>
              CareNow
            </Type>
          </Row>
          <Row style={{ gap: 8 }}>
            <AccountSwitcher />
            <Button
              size="icon"
              variant="outline"
              accessibilityLabel="Notifications"
              onPress={() => router.push("/notifications")}
            >
              <Bell size={20} color={p.ink} />
            </Button>
          </Row>
        </Row>
      </Enter>
      <Enter delay={40}>
        <View style={{ gap: 5 }}>
          <Type size={14} muted>
            {t("Hello", "স্বাগতম")}, {member.name.split(" ")[0]}
          </Type>
          <Type size={29} weight="bold" style={{ letterSpacing: -1 }}>
            {t("Your care, today", "আজকের যত্ন")}
          </Type>
        </View>
      </Enter>
      <Enter delay={70}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {state!.members.map((m) => (
            <Button
              key={m.id}
              variant={m.id === memberId ? "primary" : "outline"}
              size="sm"
              onPress={() => selectMember(m.id)}
              accessibilityState={{ selected: m.id === memberId }}
              style={{ borderRadius: 30 }}
            >
              {m.relation === "Self"
                ? t("Myself", "নিজে")
                : m.name.split(" ")[0]}
            </Button>
          ))}
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel="Add family member"
            style={{ width: 36, height: 36, borderRadius: 18 }}
            onPress={() => router.push("/member")}
          >
            <Plus size={17} color={p.ink} />
          </Button>
        </ScrollView>
      </Enter>
      <Enter delay={100}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {actions.map((a) => (
            <Button
              key={a.href}
              variant="ghost"
              onPress={() => router.push(a.href)}
              style={{
                width: "47%",
                flexGrow: 1,
                height: 106,
                borderRadius: 20,
                backgroundColor: p.card,
                borderWidth: 1,
                borderColor: p.border,
                padding: 15,
                justifyContent: "flex-start",
              }}
            >
              <View style={{ width: "100%", gap: 10 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <View
                    style={{
                      backgroundColor: a.tone,
                      borderRadius: 11,
                      width: 36,
                      height: 36,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <a.icon size={21} strokeWidth={1.8} color={p.primary} />
                  </View>
                  <ChevronRight size={16} color={p.subtle} />
                </Row>
                <Type size={15} weight="bold">
                  {a.label}
                </Type>
              </View>
            </Button>
          ))}
        </View>
      </Enter>
      {(trip || care) && (
        <Enter delay={130}>
          <Button
            variant="ghost"
            style={{
              height: "auto",
              padding: 16,
              backgroundColor: p.primary,
              borderRadius: 20,
              justifyContent: "flex-start",
            }}
            onPress={() =>
              trip
                ? router.push({
                    pathname: "/trip/[id]",
                    params: { id: trip.id },
                  })
                : router.push({
                    pathname: "/care-location",
                    params: { id: care!.id },
                  })
            }
          >
            <Row style={{ width: "100%" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: p.secondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={21} color={p.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Type size={15} weight="bold" style={{ color: p.onPrimary }}>
                  {trip ? "Your ride" : "Your care team"}
                </Type>
                <Type size={12} style={{ color: p.accent }}>
                  {trip?.status ?? care!.status} · View on map
                </Type>
              </View>
              <ArrowRight size={20} color={p.onPrimary} />
            </Row>
          </Button>
        </Enter>
      )}
      <Enter delay={160}>
        <View style={{ gap: 12 }}>
          <Section
            title={t("Next appointment", "পরবর্তী অ্যাপয়েন্টমেন্ট")}
            action="Activity"
            onPress={() => router.push("/activity")}
          />
          {upcoming && doctor ? (
            <Box>
              <Row>
                <DoctorAvatar doctor={doctor} size={54} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Type size={16} weight="bold">
                    {doctor.name}
                  </Type>
                  <Type size={12} muted>
                    {doctor.specialty} · {upcoming.mode}
                  </Type>
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  accessibilityLabel="View appointment"
                  onPress={() =>
                    router.push({
                      pathname: "/appointment/[id]",
                      params: { id: upcoming.id },
                    })
                  }
                >
                  <ChevronRight size={20} color={p.primary} />
                </Button>
              </Row>
              <Row
                style={{
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: p.border,
                  justifyContent: "space-between",
                }}
              >
                <Row style={{ gap: 6 }}>
                  <CalendarDays size={15} color={p.primary} />
                  <Type size={12}>{shortDate(upcoming.date)}</Type>
                </Row>
                <Row style={{ gap: 6 }}>
                  <Clock3 size={15} color={p.primary} />
                  <Type size={12}>{upcoming.time}</Type>
                </Row>
                <Pill text="Confirmed" />
              </Row>
            </Box>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onPress={() => router.push("/doctors")}
            >
              Find a doctor
            </Button>
          )}
        </View>
      </Enter>
      <Enter delay={180}>
        <View style={{ gap: 12 }}>
          <Section title="For your family" />
          <Row style={{ alignItems: "stretch" }}>
            {[
              {
                title: "Motherhood",
                detail: "Journal & daily care",
                icon: "flower",
                tone: "rose" as const,
                href: "/motherhood" as const,
              },
              {
                title: "Child development",
                detail: "Routines & therapy",
                icon: "sparkles",
                tone: "lavender" as const,
                href: "/child" as const,
              },
            ].map((c) => (
              <Button
                key={c.href}
                variant="ghost"
                style={{
                  flex: 1,
                  height: "auto",
                  padding: 15,
                  borderRadius: 20,
                  backgroundColor: p[c.tone],
                  justifyContent: "flex-start",
                }}
                onPress={() => router.push(c.href)}
              >
                <View style={{ gap: 10, width: "100%" }}>
                  <IconTile name={c.icon} tone="card" size={34} />
                  <Type size={14} weight="bold">
                    {c.title}
                  </Type>
                  <Type size={11} muted>
                    {c.detail}
                  </Type>
                </View>
              </Button>
            ))}
          </Row>
        </View>
      </Enter>
      {state!.preferences.reminders && (
        <Enter>
          <View style={{ gap: 12 }}>
            <Section title={t("Daily care", "দৈনন্দিন যত্ন")} />
            <Box>
              {medications
                .slice(0, member.relation === "Mother" ? 2 : 1)
                .map((m) => {
                  const key = `${today()}:${memberId}:${m.id}`,
                    done = state!.medicationEvents.includes(key);
                  return (
                    <Row key={m.id}>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Type size={14} weight="medium">
                          {m.name}
                        </Type>
                        <Type size={12} muted>
                          {m.time} · {done ? "Taken" : m.detail}
                        </Type>
                      </View>
                      <Button
                        size="icon"
                        variant={done ? "primary" : "outline"}
                        accessibilityLabel={
                          done
                            ? "Mark medication not taken"
                            : "Mark medication taken"
                        }
                        onPress={() =>
                          void act({ type: "medication.toggle", key }).catch(
                            () => {},
                          )
                        }
                      >
                        <Check
                          size={18}
                          color={done ? p.onPrimary : p.subtle}
                        />
                      </Button>
                    </Row>
                  );
                })}
            </Box>
          </View>
        </Enter>
      )}
    </Screen>
  );
}

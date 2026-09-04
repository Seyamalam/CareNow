import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/button";
import {
  Bell,
  ChevronDown,
  ArrowUpRight,
  Video,
  Clock3,
  Check,
  Plus,
  MapPin,
  Stethoscope,
  ArrowRight,
} from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Section,
  IconTile,
  Enter,
  Pill,
} from "../../components/ui";
import { BrandMark } from "../../components/brand";
import { DoctorCard } from "../../components/doctor-card";
import { useCare } from "../../lib/store";
import { usePalette } from "../../lib/theme";
import { doctors, categories, medications } from "../../shared/catalog";
import { today, shortDate } from "../../shared/contracts";
export default function Home() {
  const p = usePalette();
  const { state, memberId, selectMember, act, t } = useCare();
  const member =
    state!.members.find((m) => m.id === memberId) ?? state!.members[0];
  const upcoming = state!.appointments.find(
    (a) => a.status === "Confirmed" && a.memberId === memberId,
  );
  const doctor = doctors.find((d) => d.id === upcoming?.doctorId);
  return (
    <Screen refresh>
      <Enter>
        <Row style={{ justifyContent: "space-between" }}>
          <Row style={{ gap: 7 }}>
            <BrandMark size={31} />
            <Type size={22} weight="bold" style={{ letterSpacing: -0.8 }}>
              CareNow
            </Type>
          </Row>
          <Row>
            <Pill text="DEMO" />
            <Button
              size="icon"
              variant="outline"
              accessibilityLabel="Notifications"
              onPress={() => router.push("/notifications")}
            >
              <Bell size={20} color={p.ink} />
              {state!.notifications.some((n) => !n.read) && (
                <View
                  style={{
                    position: "absolute",
                    right: 9,
                    top: 7,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: p.primary,
                  }}
                />
              )}
            </Button>
          </Row>
        </Row>
      </Enter>
      <Enter delay={50}>
        <Row
          style={{ justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <View style={{ gap: 3 }}>
            <Type muted size={13}>
              {t("Good to see you,", "স্বাগতম,")} {member.name.split(" ")[0]}
            </Type>
            <Type size={34} weight="bold" style={{ letterSpacing: -1.3 }}>
              {t("Family overview", "পরিবারের যত্ন")}
            </Type>
          </View>
        </Row>
      </Enter>
      <Enter delay={90}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {state!.members.map((m) => (
            <Button
              key={m.id}
              variant={memberId === m.id ? "primary" : "outline"}
              onPress={() => selectMember(m.id)}
              style={{ borderRadius: 30 }}
            >
              <Row style={{ gap: 7 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: memberId === m.id ? p.accent : p.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Type size={10} weight="bold">
                    {m.name[0]}
                  </Type>
                </View>
                <Type
                  size={12}
                  weight="medium"
                  style={{ color: memberId === m.id ? p.onPrimary : p.ink }}
                >
                  {m.relation === "Self" ? t("Myself", "নিজে") : m.relation}
                </Type>
              </Row>
            </Button>
          ))}
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel="Add family member"
            onPress={() => router.push("/member")}
          >
            <Plus size={18} color={p.ink} />
          </Button>
        </ScrollView>
      </Enter>
      <Enter delay={130}>
        <View
          style={{
            backgroundColor: p.primary,
            borderRadius: 28,
            padding: 24,
            gap: 21,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              right: -40,
              top: 10,
              opacity: 0.13,
              transform: [{ rotate: "25deg" }],
            }}
          >
            <BrandMark size={230} inverse />
          </View>
          <Row style={{ justifyContent: "space-between" }}>
            <Type
              size={10}
              weight="medium"
              style={{ color: p.accent, letterSpacing: 1.8 }}
            >
              {t("UP NEXT", "পরবর্তী")}
            </Type>
            <View
              style={{
                backgroundColor: p.secondary,
                borderRadius: 15,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Type size={10} weight="medium">
                {upcoming ? "CONFIRMED" : "READY WHEN YOU ARE"}
              </Type>
            </View>
          </Row>
          <View style={{ gap: 5 }}>
            <Type size={24} weight="bold" style={{ color: p.onPrimary }}>
              {doctor?.name ?? t("Find your doctor", "আপনার ডাক্তার খুঁজুন")}
            </Type>
            <Type size={12} style={{ color: p.accent }}>
              {doctor
                ? `${doctor.specialty} · ${upcoming!.mode} consultation`
                : t("Video & audio consultations", "ভিডিও ও অডিও পরামর্শ")}
            </Type>
          </View>
          <Row style={{ justifyContent: "space-between" }}>
            <Row style={{ gap: 7 }}>
              <Clock3 size={15} color={p.accent} />
              <Type size={12} style={{ color: p.onPrimary }}>
                {upcoming
                  ? `${shortDate(upcoming.date)} · ${upcoming.time}`
                  : "11 specialties"}
              </Type>
            </Row>
            <Button
              variant="secondary"
              size="sm"
              onPress={() =>
                upcoming
                  ? router.push({
                      pathname: "/appointment/[id]",
                      params: { id: upcoming.id },
                    })
                  : router.push("/doctors")
              }
              endContent={<ArrowUpRight size={16} />}
            >
              {t("Open", "খুলুন")}
            </Button>
          </Row>
        </View>
      </Enter>
      <Enter delay={160}>
        <View style={{ gap: 16 }}>
          <Section
            title={t("Care services", "যত্ন সেবা")}
            action={t("View all", "সব দেখুন")}
            onPress={() => router.push("/care")}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {categories.map((c) => (
              <Button
                key={c.id}
                variant="ghost"
                onPress={() =>
                  c.id === "emergency"
                    ? router.push("/emergency")
                    : router.push({
                        pathname: "/care",
                        params: { category: c.id },
                      })
                }
                style={{
                  width: "48%",
                  flexGrow: 1,
                  height: 145,
                  backgroundColor: p.card,
                  borderWidth: 1,
                  borderColor: p.border,
                  borderRadius: 24,
                  padding: 17,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                <View style={{ width: "100%", gap: 11 }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <IconTile name={c.icon} tone={c.tone} size={42} />
                    <ArrowUpRight size={16} color={p.subtle} />
                  </Row>
                  <View style={{ gap: 2 }}>
                    <Type size={14} weight="bold">
                      {c.name}
                    </Type>
                    <Type size={10} muted>
                      {c.subtitle}
                    </Type>
                  </View>
                </View>
              </Button>
            ))}
          </View>
        </View>
      </Enter>
      {state!.preferences.reminders && (
        <Enter delay={190}>
          <View style={{ gap: 16 }}>
            <Section
              title={t("Today’s care", "আজকের যত্ন")}
              action={t("Health hub", "স্বাস্থ্য")}
              onPress={() =>
                router.push(
                  member.relation === "Child"
                    ? "/child"
                    : member.relation === "Self"
                      ? "/motherhood"
                      : "/records",
                )
              }
            />
            <Box>
              {medications
                .slice(0, member.relation === "Mother" ? 2 : 1)
                .map((med) => {
                  const key = `${today()}:${memberId}:${med.id}`,
                    done = state!.medicationEvents.includes(key);
                  return (
                    <Row key={med.id}>
                      <IconTile name="heart" tone="sand" size={44} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <Type size={14} weight="medium">
                          {med.name}
                        </Type>
                        <Type size={11} muted>
                          {med.time} · {done ? "Taken" : med.detail}
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
      <Enter delay={220}>
        <View style={{ gap: 16 }}>
          <Section
            title={t("Your care specialists", "আপনার বিশেষজ্ঞ")}
            action={t("See all", "সব দেখুন")}
            onPress={() => router.push("/doctors")}
          />
          <DoctorCard doctor={doctors[0]} compact />
        </View>
      </Enter>
      <Row style={{ justifyContent: "center", gap: 5, paddingTop: 6 }}>
        <MapPin size={11} color={p.subtle} />
        <Type size={10} muted>
          Dhaka & Chattogram
        </Type>
        <Type size={10} muted>
          ·
        </Type>
        <Type size={10} muted>
          Exhibition demo
        </Type>
      </Row>
    </Screen>
  );
}

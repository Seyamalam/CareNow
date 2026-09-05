import { AccountSwitcher } from "../components/account-switcher";
import { TripEta } from "../components/trip-eta";
import { motionProgress, type RouteMotion } from "../components/maps/model";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  MapPin,
  UserRound,
  ShieldCheck,
  ArrowRight,
} from "lucide-react-native";
import { RouteMap } from "../components/maps/route-map";
import { Type, Row, Screen, Box, Pill, Empty } from "../components/ui";
import { Button } from "../components/button";
import { useCare } from "../lib/store";
import { usePalette } from "../lib/theme";
import { services } from "../shared/catalog";
import { approachRoute, pointOnRoute } from "../shared/transport";
import { useReducedMotion } from "react-native-reanimated";
export default function CareLocation() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { state, act, pending, offline } = useCare(),
    p = usePalette(),
    reduced = useReducedMotion();
  const r = state!.requests.find((r) => r.id === id);
  const pickup = /dhanmondi/i.test(r?.address ?? "") ? "dhanmondi" : "banani";
  const route = approachRoute(pickup),
    arrived = r?.status === "Arrived" || r?.status === "Completed";
  const motion = useMemo<RouteMotion | undefined>(
    () =>
      r?.status === "On the way"
        ? {
            route,
            clock: state!.exhibition.clock,
            start: r.motionStart,
            duration: 60000,
          }
        : undefined,
    [route, r?.status, r?.motionStart, state!.exhibition.clock],
  );
  const progress = motion ? motionProgress(motion) : 0;
  const markers = useMemo(
    () => [
      {
        id: "home",
        coordinate: route.coordinates[route.coordinates.length - 1],
        label: "A",
      },
      {
        id: "staff",
        coordinate: pointOnRoute(route, arrived ? 1 : progress),
        label: "Demo care professional",
        kind: "person" as const,
        motion,
      },
    ],
    [route, arrived, motion],
  );
  if (!r)
    return (
      <Screen back title="Care team">
        <Empty title="Request not found" />
      </Screen>
    );
  return (
    <Screen back title="Care team" right={<AccountSwitcher />}>
      <View style={{ height: 350, borderRadius: 22, overflow: "hidden" }}>
        <RouteMap route={route} markers={markers} offline={offline} />
      </View>
      <Box>
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Type size={23} weight="bold">
              {arrived
                ? "Your care team is here"
                : r.status === "Cancelled"
                  ? "Request cancelled"
                  : r.status === "On the way"
                    ? "Nusrat is on the way"
                    : "Your care professional"}
            </Type>
            <Type muted size={12}>
              {services.find((s) => s.id === r.serviceId)?.name}
            </Type>
          </View>
          {!["Cancelled", "Completed", "Arrived"].includes(r.status) && (
            <View style={{alignItems:'center',padding:10,backgroundColor:p.mint,borderRadius:14}}><TripEta motion={motion} minutes={Math.ceil(route.duration/60*1.6)} arrived={arrived}/><Type size={10} muted>MIN</Type></View>
          )}
        </Row>
        <Row>
          <View
            style={{
              backgroundColor: p.mint,
              width: 54,
              height: 54,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserRound size={26} color={p.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Type weight="bold">Nusrat Jahan</Type>
            <Type size={12} muted>
              Care professional · Demo profile
            </Type>
          </View>
          <ShieldCheck size={23} color={p.primary} />
        </Row>
        <Row>
          <MapPin size={18} color={p.primary} />
          <Type size={12} style={{ flex: 1 }}>
            {r.address}, {r.city}
          </Type>
        </Row>
        <Type size={11} muted>
          Map preview: {pickup === "dhanmondi" ? "Dhanmondi" : "Banani"}, Dhaka
          · Simulated position
        </Type>
      </Box>
      {!["Cancelled", "Completed"].includes(r.status) &&
        state!.exhibition.enabled && (
          <Button onPress={() => router.push("/presenter")}>
            Presenter controls
          </Button>
        )}
    </Screen>
  );
}

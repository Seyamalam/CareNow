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
    { state, act, pending } = useCare(),
    p = usePalette(),
    reduced = useReducedMotion();
  const r = state!.requests.find((r) => r.id === id),
    [progress, setProgress] = useState(0.15);
  useEffect(() => {
    if (r?.status !== "On the way" || reduced) return;
    const timer = setInterval(
      () => setProgress((p) => Math.min(0.95, p + 0.008)),
      500,
    );
    return () => clearInterval(timer);
  }, [r?.status, reduced]);
  const pickup = /dhanmondi/i.test(r?.address ?? "") ? "dhanmondi" : "banani";
  const route = approachRoute(pickup),
    arrived = r?.status === "Arrived" || r?.status === "Completed";
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
      },
    ],
    [route, arrived, progress],
  );
  if (!r)
    return (
      <Screen back title="Care team">
        <Empty title="Request not found" />
      </Screen>
    );
  return (
    <Screen back title="Care team" right={<Pill text="SIMULATION" />}>
      <View style={{ height: 350, borderRadius: 22, overflow: "hidden" }}>
        <RouteMap route={route} markers={markers} />
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
            <Pill
              text={`${Math.max(1, Math.ceil((route.duration / 60) * 1.6 * (1 - progress)))} MIN`}
            />
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
      {["Requested", "Assigned", "On the way"].includes(r.status) && (
        <Button
          fullWidth
          size="lg"
          loading={pending}
          endContent={<ArrowRight size={18} />}
          onPress={() =>
            void act({
              type: "request.status",
              id: r.id,
              status:
                r.status === "Requested"
                  ? "Assigned"
                  : r.status === "Assigned"
                    ? "On the way"
                    : "Arrived",
            }).catch(() => {})
          }
        >
          Demo:{" "}
          {r.status === "Requested"
            ? "assign care team"
            : r.status === "Assigned"
              ? "start tracking"
              : "mark arrived"}
        </Button>
      )}
    </Screen>
  );
}

import { useEffect, useMemo, useState } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import {
  ArrowLeft,
  ArrowRight,
  LocateFixed,
  Check,
  ShieldCheck,
} from "lucide-react-native";
import { Card } from "panelui-native";
import { Button } from "../../components/button";
import { Type, Row, Pill, Screen, Empty } from "../../components/ui";
import { Confirm } from "../../components/confirm";
import { RouteMap } from "../../components/maps/route-map";
import { VehicleArt } from "../../components/vehicle-art";
import { useCare } from "../../lib/store";
import { usePalette } from "../../lib/theme";
import {
  vehicles,
  roadRoute,
  approachRoute,
  pointOnRoute,
  quoteTrip,
  stopName,
  tripStatuses,
} from "../../shared/transport";
import { money } from "../../shared/contracts";
export default function TrackTrip() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { state, act, pending } = useCare(),
    p = usePalette(),
    insets = useSafeAreaInsets(),
    { height } = useWindowDimensions(),
    reduced = useReducedMotion();
  const [now, setNow] = useState(Date.now()),
    [recenter, setRecenter] = useState(0),
    [cancel, setCancel] = useState(false);
  const trip = state!.trips.find((t) => t.id === id);
  useEffect(() => {
    if (reduced || !trip || !["On the way", "On trip"].includes(trip.status))
      return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [trip?.status, reduced]);
  const route = trip
    ? trip.status === "On trip" || trip.status === "Completed"
      ? roadRoute(trip.pickup, trip.destination)!
      : approachRoute(trip.pickup)
    : roadRoute("banani", "hospital")!;
  const progress =
    trip?.status === "At pickup" || trip?.status === "Completed"
      ? 1
      : trip?.status === "Assigned"
        ? 0
        : Math.min(
            0.95,
            Math.max(
              0,
              (now - new Date(trip?.updatedAt ?? now).getTime()) / 60000,
            ),
          );
  const travelling = trip?.status === "On trip" || trip?.status === "Completed";
  const markers = useMemo(
    () => [
      ...(travelling
        ? [{ id: "start", coordinate: route.coordinates[0], label: "A" }]
        : []),
      {
        id: "end",
        coordinate: route.coordinates[route.coordinates.length - 1],
        label: travelling ? "B" : "A",
      },
      {
        id: "driver",
        coordinate: pointOnRoute(route, progress),
        label: "Demo driver location",
        kind: trip?.vehicle ?? ("ambulance" as const),
        active: true,
      },
    ],
    [route, progress, trip?.vehicle, travelling],
  );
  if (!trip)
    return (
      <Screen back title="Trip">
        <Empty
          title="Trip not found"
          action="Transport"
          onPress={() => router.replace("/transport")}
        />
      </Screen>
    );
  const vehicle = vehicles.find((v) => v.id === trip.vehicle)!,
    step = tripStatuses.findIndex((s) => s === trip.status),
    next = tripStatuses[step + 1],
    closed = ["Completed", "Cancelled"].includes(trip.status);
  const eta = Math.max(
    1,
    Math.ceil(
      (trip.status === "On trip"
        ? quoteTrip(trip.vehicle, trip.pickup, trip.destination)!.minutes
        : vehicle.eta) *
        (1 - progress),
    ),
  );
  return (
    <View
      style={{ flex: 1, backgroundColor: p.background, paddingTop: insets.top }}
    >
      <Row
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          justifyContent: "space-between",
        }}
      >
        <Row>
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/transport")
            }
          >
            <ArrowLeft size={20} color={p.ink} />
          </Button>
          <Type size={23} weight="bold">
            Your trip
          </Type>
        </Row>
        <Pill text="SIMULATION" />
      </Row>
      <View style={{ flex: 1, minHeight: 200 }}>
        <RouteMap route={route} markers={markers} recenter={recenter} />
        <View style={{ position: "absolute", right: 16, bottom: 15 }}>
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel="Recenter trip"
            onPress={() => setRecenter((x) => x + 1)}
          >
            <LocateFixed size={20} color={p.primary} />
          </Button>
        </View>
      </View>
      <Card
        style={{
          borderRadius: 0,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          marginTop: -4,
          maxHeight: height * 0.55,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 22,
            paddingBottom: insets.bottom + 20,
            gap: 16,
          }}
        >
          <Row style={{ justifyContent: "space-between" }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Type size={25} weight="bold">
                {trip.status === "Assigned"
                  ? "Driver assigned"
                  : trip.status === "On the way"
                    ? "Driver is on the way"
                    : trip.status === "At pickup"
                      ? "Your ride is here"
                      : trip.status === "On trip"
                        ? "Heading to your stop"
                        : `Trip ${trip.status.toLowerCase()}`}
              </Type>
              <Type size={12} muted>
                {trip.status === "On trip"
                  ? stopName(trip.destination)
                  : stopName(trip.pickup)}
              </Type>
            </View>
            {!closed && (
              <View
                style={{
                  backgroundColor: p.mint,
                  padding: 12,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Type size={24} weight="bold">
                  {trip.status === "At pickup" ? 0 : eta}
                </Type>
                <Type size={10} muted>
                  MIN
                </Type>
              </View>
            )}
          </Row>
          <Row style={{ gap: 5 }}>
            {tripStatuses.map((s, i) => (
              <View
                key={s}
                style={{
                  height: 4,
                  borderRadius: 2,
                  flex: 1,
                  backgroundColor: i <= step ? p.primary : p.border,
                }}
              />
            ))}
          </Row>
          <Row>
            <View
              style={{ backgroundColor: p.mint, borderRadius: 16, padding: 6 }}
            >
              <VehicleArt kind={trip.vehicle} selected size={68} />
            </View>
            <View style={{ flex: 1 }}>
              <Type size={16} weight="bold">
                {vehicle.driver}
              </Type>
              <Type size={12} muted>
                {vehicle.name} · {vehicle.plate}
              </Type>
            </View>
            <ShieldCheck size={23} color={p.primary} />
          </Row>
          <Row style={{ justifyContent: "space-between" }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Type size={12}>A · {stopName(trip.pickup)}</Type>
              <Type size={12}>B · {stopName(trip.destination)}</Type>
            </View>
            <Type size={22} weight="bold">
              {money(trip.fare)}
            </Type>
          </Row>
          {!closed && next && next !== "Assigned" && (
            <Button
              fullWidth
              size="lg"
              loading={pending}
              onPress={() =>
                void act({ type: "trip.status", id: trip.id, status: next })
                  .then(() => setNow(Date.now()))
                  .catch(() => {})
              }
              endContent={<ArrowRight size={18} />}
            >{`Demo: ${next === "On the way" ? "start tracking" : next === "At pickup" ? "arrive at pickup" : next === "On trip" ? "start trip" : "complete trip"}`}</Button>
          )}
          {closed ? (
            <Button fullWidth onPress={() => router.replace("/transport")}>
              Book another ride
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onPress={() => setCancel(true)}>
              Cancel trip
            </Button>
          )}
          <Type size={10} muted style={{ textAlign: "center" }}>
            Simulated driver · Estimated timing · No real dispatch
          </Type>
        </ScrollView>
      </Card>
      <Confirm
        open={cancel}
        setOpen={setCancel}
        title="Cancel this trip?"
        detail={`${vehicle.name} · ${stopName(trip.pickup)}`}
        label="Cancel trip"
        loading={pending}
        onConfirm={() =>
          void act({ type: "trip.status", id: trip.id, status: "Cancelled" })
            .then(() => setCancel(false))
            .catch(() => {})
        }
      />
    </View>
  );
}

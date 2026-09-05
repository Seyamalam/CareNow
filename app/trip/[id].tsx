import { TripEta } from "../../components/trip-eta";
import { MotionArt } from "../../components/motion-art";
import { motionProgress, type RouteMotion } from "../../components/maps/model";
import { AccountSwitcher } from "../../components/account-switcher";
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
    { state, act, pending, offline } = useCare(),
    p = usePalette(),
    insets = useSafeAreaInsets(),
    { height } = useWindowDimensions(),
    reduced = useReducedMotion();
  const [follow, setFollow] = useState(false),
    [recenter, setRecenter] = useState(0),
    [cancel, setCancel] = useState(false);
  const trip = state!.trips.find((t) => t.id === id);
  const route = trip
    ? trip.status === "On trip" || trip.status === "Completed"
      ? roadRoute(trip.pickup, trip.destination)!
      : approachRoute(trip.pickup)
    : roadRoute("banani", "hospital")!;
  const motion = useMemo<RouteMotion | undefined>(
    () =>
      trip && ["On the way", "On trip"].includes(trip.status)
        ? {
            route,
            clock: state!.exhibition.clock,
            start: trip.motionStart,
            duration: 60000,
          }
        : undefined,
    [route, trip?.status, trip?.motionStart, state!.exhibition.clock],
  );
  const progress =
    trip?.status === "At pickup" || trip?.status === "Completed"
      ? 1
      : motion
        ? motionProgress(motion)
        : 0;
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
        motion,
      },
    ],
    [route, motion, trip?.vehicle, travelling, trip?.status],
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
  return (
    <View
      style={{ flex: 1, backgroundColor: p.background, paddingTop: insets.top }}
    >
      <Row
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          justifyContent: "space-between",
          flexWrap: "wrap",
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
        <AccountSwitcher />
      </Row>
      <View style={{ flex: 1, minHeight: 100 }}>
        <RouteMap
          route={route}
          markers={markers}
          recenter={recenter}
          follow={follow && !!motion}
          offline={offline}
        />
        {!offline && motion && (
          <View style={{ position: "absolute", right: 16, bottom: 15 }}>
            <Button
              size="icon"
              variant={follow ? "primary" : "outline"}
              accessibilityLabel={follow ? "Show whole route" : "Follow driver"}
              onPress={() => {
                setFollow(!follow);
                setRecenter((x) => x + 1);
              }}
            >
              <LocateFixed size={20} color={follow ? p.onPrimary : p.primary} />
            </Button>
          </View>
        )}
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
                {travelling
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
                <TripEta
                  motion={motion}
                  minutes={
                    travelling
                      ? quoteTrip(trip.vehicle, trip.pickup, trip.destination)!
                          .minutes
                      : vehicle.eta
                  }
                  arrived={trip.status === "At pickup"}
                />
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
          {!!trip.options.departure && (
            <Type size={12}>
              Departure ·{" "}
              {new Date(trip.options.departure).toLocaleString("en-GB", {
                timeZone: "Asia/Dhaka",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Type>
          )}
          {trip.vehicle === "bus" && (
            <Type size={12}>
              {trip.options.passengers} passengers · AC minibus
            </Type>
          )}
          {trip.vehicle === "truck" && (
            <Type size={12}>
              {trip.options.truckSize} · {trip.options.cargo}
            </Type>
          )}
          {trip.status === "Completed" && (
            <View style={{ alignItems: "center" }}>
              <MotionArt kind="success" size={80} />
            </View>
          )}
          {!closed &&
            (state!.workspace.role !== "customer" ||
              state!.exhibition.enabled) && (
              <Button
                variant="secondary"
                onPress={() =>
                  router.push(
                    state!.exhibition.enabled ? "/presenter" : "/workspace",
                  )
                }
              >
                {state!.exhibition.enabled
                  ? "Presenter controls"
                  : state!.workspace.role === "driver"
                    ? "Manage this trip"
                    : "View account workspace"}
              </Button>
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

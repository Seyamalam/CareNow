import { MapPanel } from "../../components/map-panel";
import { RideOptions } from "../../components/ride-options";
import { defaultRideOptions } from "../../shared/transport";
import { AccountSwitcher } from "../../components/account-switcher";
import { useMemo, useState } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  LocateFixed,
  ChevronRight,
  History,
} from "lucide-react-native";
import { Card } from "panelui-native";
import { Button } from "../../components/button";
import { Type, Row, Pill, Enter } from "../../components/ui";
import { VehicleArt } from "../../components/vehicle-art";
import { RouteMap } from "../../components/maps/route-map";
import { StopPicker } from "../../components/stop-picker";
import { usePalette } from "../../lib/theme";
import { useCare } from "../../lib/store";
import {
  vehicles,
  roadRoute,
  quoteTrip,
  approachRoute,
  pointOnRoute,
  type VehicleKind,
} from "../../shared/transport";
import { money } from "../../shared/contracts";
export default function Transport() {
  const p = usePalette(),
    insets = useSafeAreaInsets(),
    { width, height } = useWindowDimensions(),
    wide = width > 900;
  const params = useLocalSearchParams<{ kind?: string }>();
  const [options, setOptions] = useState(defaultRideOptions);
  const [mapHeight, setMapHeight] = useState(height * 0.7);
  const [panelHeight, setPanelHeight] = useState(300);
  const [chosen, setChosen] = useState<VehicleKind>("ambulance"),
    [pickup, setPickup] = useState("banani"),
    [destination, setDestination] = useState("hospital"),
    [recenter, setRecenter] = useState(0);
  const kind = vehicles.find((v) => v.id === params.kind)?.id ?? chosen;
  const { act, pending, memberId, state, offline } = useCare();
  const route = roadRoute(pickup, destination)!,
    quote = quoteTrip(kind, pickup, destination, options)!,
    vehicle = vehicles.find((v) => v.id === kind)!;
  const active = state!.trips.find(
    (t) => !["Completed", "Cancelled"].includes(t.status),
  );
  const markers = useMemo(
    () => [
      { id: "pickup", coordinate: route.coordinates[0], label: "A" },
      {
        id: "destination",
        coordinate: route.coordinates[route.coordinates.length - 1],
        label: "B",
      },
      ...vehicles.map((v, i) => ({
        id: v.id,
        coordinate: pointOnRoute(
          i === 0 ? approachRoute(pickup) : route,
          i === 0 ? 0.1 : 0.15 + i * 0.2,
        ),
        label: `${v.name} · demo vehicle`,
        kind: v.id,
        active: v.id === kind,
      })),
    ],
    [route, pickup, kind],
  );
  function select(id: string) {
    const v = vehicles.find((v) => v.id === id);
    if (v) {
      setChosen(v.id);
      setOptions(defaultRideOptions);
      router.setParams({ kind: v.id });
    }
  }
  async function book() {
    try {
      const next = await act({
        type: "trip.book",
        vehicle: kind,
        pickup,
        destination,
        memberId,
        options,
      });
      router.push({ pathname: "/trip/[id]", params: { id: next.trips[0].id } });
    } catch {}
  }
  return (
    <View
      style={{ flex: 1, backgroundColor: p.background, paddingTop: insets.top }}
    >
      <Row
        style={{
          paddingHorizontal: 22,
          paddingVertical: 14,
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <View>
          <Type size={27} weight="bold">
            Transport
          </Type>
          <Type size={12} muted>
            Dhaka{" "}
            <Type size={12} muted>
              · Demo fleet
            </Type>
          </Type>
        </View>
        <AccountSwitcher />
        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push("/activity")}
          startContent={<History size={16} />}
        >
          Trips
        </Button>
      </Row>
      <View
        onLayout={(event) => setMapHeight(event.nativeEvent.layout.height)}
        style={{
          flex: 1,
          flexDirection: wide ? "row" : "column",
          width: "100%",
          maxWidth: 1200,
          alignSelf: "center",
        }}
      >
        <View style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <RouteMap
            offline={offline}
            bottomInset={wide ? 0 : panelHeight}
            route={route}
            markers={markers}
            recenter={recenter}
            onMarkerPress={select}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 14,
              left: 18,
              backgroundColor: p.card,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Row style={{ gap: 6 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: p.primary,
                }}
              />
              <Type size={12} weight="medium">
                {(quote.distance / 1000).toFixed(1)} km · ~{quote.minutes} min
              </Type>
            </Row>
          </View>
          {!offline && (
            <View style={{ position: "absolute", top: 60, right: 16 }}>
              <Button
                size="icon"
                variant="outline"
                accessibilityLabel="Show whole route"
                onPress={() => setRecenter((x) => x + 1)}
              >
                <LocateFixed size={20} color={p.primary} />
              </Button>
            </View>
          )}
        </View>
        <MapPanel
          wide={wide}
          availableHeight={mapHeight}
          onHeightChange={setPanelHeight}
          footer={
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 16,
                gap: 8,
                borderTopWidth: 1,
                borderTopColor: p.border,
              }}
            >
              <Row style={{ flexWrap: "wrap" }}>
                <View style={{ minWidth: 110, flexShrink: 0 }}>
                  <Type size={11} muted>
                    Estimated fare
                  </Type>
                  <Type size={25} weight="bold">
                    {money(quote.fare)}
                  </Type>
                </View>
                <Button
                  style={{ flex: 1 }}
                  size="lg"
                  disabled={!!active}
                  loading={pending}
                  onPress={() => void book()}
                  endContent={<ArrowRight size={18} />}
                >
                  {`Book ${kind === "accessible" ? "van" : kind}`}
                </Button>
              </Row>
              <Type size={10} muted style={{ textAlign: "center" }}>
                Demo booking · No dispatch or payment
              </Type>
            </View>
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 10, gap: 14 }}
          >
            <StopPicker
              pickup={pickup}
              destination={destination}
              onChange={(a, b) => {
                setPickup(a);
                setDestination(b);
              }}
            />
            <Row style={{ justifyContent: "space-between" }}>
              <Type size={17} weight="bold">
                Choose your ride
              </Type>
              <Type size={11} muted>
                {vehicle.eta} min away
              </Type>
            </Row>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, alignItems: "stretch" }}
            >
              {vehicles.map((v) => (
                <Button
                  key={v.id}
                  variant="ghost"
                  accessibilityLabel={`Select ${v.name}`}
                  accessibilityState={{ selected: kind === v.id }}
                  onPress={() => select(v.id)}
                  style={{
                    width: 102,
                    flexShrink: 0,
                    minHeight: 108,
                    height: "auto",
                    paddingHorizontal: 2,
                    paddingVertical: 5,
                    borderWidth: kind === v.id ? 2 : 1,
                    borderColor: kind === v.id ? p.primary : p.border,
                    backgroundColor: kind === v.id ? p.mint : p.card,
                    borderRadius: 14,
                  }}
                >
                  <View style={{ alignItems: "center", gap: 3, width: "100%" }}>
                    <VehicleArt
                      kind={v.id}
                      size={60}
                      selected={kind === v.id}
                    />
                    <Type
                      size={11}
                      weight="medium"
                      style={{ textAlign: "center" }}
                    >
                      {v.id === "accessible"
                        ? "Access van"
                        : v.id === "truck"
                          ? "Truck"
                          : v.name}
                    </Type>
                    <Type size={9} muted style={{ textAlign: "center" }}>
                      {v.capacity}
                    </Type>
                  </View>
                </Button>
              ))}
            </ScrollView>
            <Type size={12} muted>
              {vehicle.detail}
            </Type>
            <RideOptions kind={kind} value={options} onChange={setOptions} />
            {active && (
              <Button
                variant="secondary"
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: "/trip/[id]",
                    params: { id: active.id },
                  })
                }
                endContent={<ChevronRight size={16} />}
              >
                Track active trip
              </Button>
            )}
          </ScrollView>
        </MapPanel>
      </View>
    </View>
  );
}

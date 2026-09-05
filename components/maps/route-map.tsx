import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import { MovingMarker } from "./animated-marker";
import { UserRound } from "lucide-react-native";
import { useReducedMotion } from "react-native-reanimated";
import { usePalette } from "../../lib/theme";
import { routeBounds } from "../../shared/transport";
import { Type } from "../ui";
import { Button } from "../button";
import { VehicleArt } from "../vehicle-art";
import { MAP_STYLE, lineFeature, type RouteMapProps } from "./model";
export function RouteMap({
  route,
  markers,
  recenter = 0,
  onMarkerPress,
}: RouteMapProps) {
  const p = usePalette(),
    camera = useRef<CameraRef>(null),
    reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (loaded)
      camera.current?.fitBounds(routeBounds(route), {
        padding: { top: 60, bottom: 52, left: 55, right: 55 },
        duration: reduced ? 0 : 650,
      });
  }, [route, recenter, loaded, reduced]);
  return (
    <View style={{ flex: 1, backgroundColor: p.muted }}>
      <Map
        key={retry}
        mapStyle={MAP_STYLE}
        style={{ flex: 1 }}
        compass={false}
        logo={false}
        attributionPosition={{ bottom: 8, left: 8 }}
        onDidFinishLoadingMap={() => {
          setLoaded(true);
          setFailed(false);
        }}
        onDidFailLoadingMap={() => setFailed(true)}
      >
        <Camera
          ref={camera}
          initialViewState={{
            bounds: routeBounds(route),
            padding: { top: 60, bottom: 52, left: 55, right: 55 },
          }}
        />
        <GeoJSONSource id="journey" data={lineFeature(route)}>
          <Layer
            id="route-outline"
            type="line"
            paint={{ "line-color": p.card, "line-width": 9 }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
          <Layer
            id="route-line"
            type="line"
            paint={{ "line-color": p.primary, "line-width": 5 }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </GeoJSONSource>
        {markers.map((m) => (
          <MovingMarker
            key={m.id}
            id={m.id}
            lngLat={m.coordinate}
            onPress={() => onMarkerPress?.(m.id)}
          >
            <View
              collapsable={false}
              accessibilityLabel={m.label}
              style={{
                backgroundColor: m.kind ? p.card : p.primary,
                borderRadius: m.kind ? 14 : 20,
                borderWidth: 2,
                borderColor: p.card,
                padding: m.kind ? 3 : 6,
                minWidth: 32,
                alignItems: "center",
                boxShadow: `0 3px 8px ${p.border}`,
              }}
            >
              {m.kind === "person" ? (
                <UserRound size={24} color={p.primary} />
              ) : m.kind ? (
                <VehicleArt kind={m.kind} size={48} selected={m.active} />
              ) : (
                <Type size={12} weight="bold" style={{ color: p.onPrimary }}>
                  {m.label}
                </Type>
              )}
            </View>
          </MovingMarker>
        ))}
      </Map>
      {failed && (
        <View
          style={{
            position: "absolute",
            top: 10,
            left: 16,
            right: 16,
            backgroundColor: p.card,
            padding: 12,
            borderRadius: 14,
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              setLoaded(false);
              setFailed(false);
              setRetry((x) => x + 1);
            }}
          >
            Map unavailable · Retry
          </Button>
        </View>
      )}
    </View>
  );
}

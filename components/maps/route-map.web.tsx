import { OfflineMap } from "./offline-map";
import { useMotionActive } from "../../lib/motion";
import { pointOnRoute } from "../../shared/transport";
import { motionProgress } from "./model";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { createPortal } from "react-dom";
import { UserRound } from "lucide-react-native";
import { VehicleArt } from "../vehicle-art";
import { Type } from "../ui";
import { useReducedMotion } from "react-native-reanimated";
import type {
  Map as LibreMap,
  Marker as LibreMarker,
  GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { usePalette } from "../../lib/theme";
import { routeBounds } from "../../shared/transport";
import { Button } from "../button";
import { MAP_STYLE, lineFeature, type RouteMapProps } from "./model";
export function RouteMap({
  route,
  markers,
  recenter = 0,
  follow = false,
  offline = false,
  bottomInset = 0,
  onMarkerPress,
}: RouteMapProps) {
  const active = useMotionActive();
  const host = useRef<View>(null),
    map = useRef<LibreMap | null>(null),
    pins = useRef<
      { id: string; marker: LibreMarker; element: HTMLButtonElement }[]
    >([]),
    p = usePalette(),
    reduced = useReducedMotion();
  const [hosts, setHosts] = useState<
    { id: string; element: HTMLButtonElement }[]
  >([]);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0);
  const initialRoute = useRef(route),
    onPress = useRef(onMarkerPress);
  onPress.current = onMarkerPress;
  useEffect(() => {
    if (offline) return;
    setReady(false);
    initialRoute.current = route;
    let disposed = false;
    let resize: ResizeObserver | undefined;
    const timeout = setTimeout(() => setFailed(true), 18000);
    import("maplibre-gl")
      .then((lib) => {
        if (disposed || !host.current) return;
        lib.setWorkerUrl("/maplibre-gl-worker.mjs");
        const m = new lib.Map({
          container: host.current as unknown as HTMLElement,
          style: MAP_STYLE,
          attributionControl: false,
          bounds: routeBounds(initialRoute.current),
          fitBoundsOptions: {
            padding: { top: 55, left: 55, right: 55, bottom: 55 + bottomInset },
          },
          renderWorldCopies: false,
        });
        m.addControl(
          new lib.AttributionControl({ compact: true }),
          "top-right",
        );
        map.current = m;
        m.on("load", () => {
          if (disposed) return;
          m.addSource("journey", {
            type: "geojson",
            data: lineFeature(initialRoute.current),
          });
          m.addLayer({
            id: "route-outline",
            type: "line",
            source: "journey",
            paint: { "line-color": p.card, "line-width": 9 },
            layout: { "line-cap": "round", "line-join": "round" },
          });
          m.addLayer({
            id: "route-line",
            type: "line",
            source: "journey",
            paint: { "line-color": p.primary, "line-width": 5 },
            layout: { "line-cap": "round", "line-join": "round" },
          });
          clearTimeout(timeout);
          setReady(true);
          setFailed(false);
        });
        m.on("error", (event) => {
          console.error("CareNow map:", event.error.message);
          if (!m.isStyleLoaded()) setFailed(true);
        });
        resize = new ResizeObserver(() => m.resize());
        resize.observe(host.current as unknown as HTMLElement);
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      clearTimeout(timeout);
      resize?.disconnect();
      pins.current.forEach((p) => p.marker.remove());
      pins.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [retry, p.card, p.primary, offline]);
  useEffect(() => {
    if (!ready || !map.current) return;
    const source = map.current.getSource<GeoJSONSource>("journey");
    if (source) source.setData(lineFeature(route));
    if (!follow)
      map.current.fitBounds(routeBounds(route), {
        padding: { top: 55, left: 55, right: 55, bottom: 55 + bottomInset },
        duration: reduced ? 0 : 650,
      });
  }, [ready, route, recenter, reduced, follow, bottomInset]);
  useEffect(() => {
    if (!ready || !map.current) return;
    let cancelled = false;
    import("maplibre-gl").then((lib) => {
      if (cancelled || !map.current) return;
      let changed = false;
      for (const old of pins.current)
        if (!markers.some((p) => p.id === old.id)) {
          old.marker.remove();
          changed = true;
        }
      pins.current = pins.current.filter((p) =>
        markers.some((m) => m.id === p.id),
      );
      for (const pin of markers) {
        const existing = pins.current.find((p) => p.id === pin.id);
        if (existing) {
          existing.marker.setLngLat(pin.coordinate);
          existing.element.setAttribute("aria-label", pin.label);
          continue;
        }
        const element = document.createElement("button");
        element.type = "button";
        element.setAttribute("aria-label", pin.label);
        Object.assign(element.style, {
          background: pin.kind ? p.card : p.primary,
          border: `2px solid ${p.card}`,
          borderRadius: pin.kind ? "12px" : "50%",
          minWidth: "32px",
          height: pin.kind ? "38px" : "32px",
          padding: pin.kind ? "0 3px" : "0 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 3px 10px ${p.border}`,
          cursor: "pointer",
        });
        element.onclick = () => onPress.current?.(pin.id);
        const marker = new lib.Marker({ element })
          .setLngLat(pin.coordinate)
          .addTo(map.current!);
        pins.current.push({ id: pin.id, marker, element });
        changed = true;
      }
      if (changed)
        setHosts(pins.current.map(({ id, element }) => ({ id, element })));
    });
    return () => {
      cancelled = true;
    };
  }, [ready, markers, p.card, p.primary, p.onPrimary, p.border]);
  useEffect(() => {
    if (!ready || !active || offline) return;
    let frame = 0,
      lastCamera = 0;
    const moving = markers.filter((m) => m.motion);
    if (!moving.length) return;
    const tick = (now: number) => {
      for (const m of moving) {
        const pin = pins.current.find((p) => p.id === m.id);
        if (pin && m.motion) {
          const coordinate = pointOnRoute(
            m.motion.route,
            motionProgress(m.motion),
          );
          pin.marker.setLngLat(coordinate);
          const next = pointOnRoute(
            m.motion.route,
            Math.min(1, motionProgress(m.motion) + 0.002),
          );
          const heading =
            pin.element.querySelector<HTMLElement>("[data-heading]");
          if (heading) {
            const bearing =
              (Math.atan2(
                (next[0] - coordinate[0]) *
                  Math.cos((coordinate[1] * Math.PI) / 180),
                next[1] - coordinate[1],
              ) *
                180) /
              Math.PI;
            heading.style.transform = `rotate(${bearing}deg)`;
          }
          if (follow && now - lastCamera > 1500) {
            map.current?.easeTo({
              center: coordinate,
              zoom: 15.5,
              duration: reduced ? 0 : 900,
            });
            lastCamera = now;
          }
        }
      }
      if (
        !reduced &&
        !document.hidden &&
        moving.some(
          (m) =>
            m.motion &&
            !m.motion.clock.paused &&
            motionProgress(m.motion) < 0.95,
        )
      )
        frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    restart();
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [ready, active, offline, markers, follow, reduced]);
  if (offline) return <OfflineMap route={route} markers={markers} />;
  return (
    <View style={{ flex: 1, backgroundColor: p.muted }}>
      <View
        ref={host}
        style={{ flex: 1 }}
        accessibilityLabel="Street map with route and demo vehicles"
      />
      {hosts.map((h) => {
        const pin = markers.find((p) => p.id === h.id);
        return pin
          ? createPortal(
              <>
                {" "}
                {pin.motion && (
                  <span
                    data-heading="true"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -15,
                      left: "calc(50% - 6px)",
                      color: p.primary,
                      fontSize: 14,
                      lineHeight: "14px",
                      transformOrigin: "50% 30px",
                    }}
                  >
                    ▲
                  </span>
                )}
                {pin.kind === "person" ? (
                  <UserRound size={24} color={p.primary} />
                ) : pin.kind ? (
                  <VehicleArt kind={pin.kind} size={48} selected={pin.active} />
                ) : (
                  <Type size={12} weight="bold" style={{ color: p.onPrimary }}>
                    {pin.label}
                  </Type>
                )}
              </>,
              h.element,
              h.id,
            )
          : null;
      })}
      {failed && (
        <View style={{ position: "absolute", top: 12, left: 16, right: 16 }}>
          <Button
            variant="secondary"
            onPress={() => {
              setReady(false);
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

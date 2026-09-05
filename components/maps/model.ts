import type {
  Coordinate,
  RoadRoute,
  VehicleKind,
} from "../../shared/transport";
import { clockTime, type DemoClock } from "../../shared/workspace";
export type RouteMotion = {
  route: RoadRoute;
  clock: DemoClock;
  start: number;
  duration: number;
};
export function motionProgress(m: RouteMotion) {
  return Math.min(
    0.95,
    Math.max(0, (clockTime(m.clock) - m.start) / m.duration),
  );
}
export type MapMarker = {
  id: string;
  coordinate: Coordinate;
  label: string;
  kind?: VehicleKind | "person";
  active?: boolean;
  motion?: RouteMotion;
};
export type RouteMapProps = {
  route: RoadRoute;
  markers: MapMarker[];
  recenter?: number;
  follow?: boolean;
  offline?: boolean;
  bottomInset?: number;
  onMarkerPress?: (id: string) => void;
};
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
export function lineFeature(
  route: RoadRoute,
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: route.coordinates },
  };
}

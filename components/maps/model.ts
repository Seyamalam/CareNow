import type {
  Coordinate,
  RoadRoute,
  VehicleKind,
} from "../../shared/transport";
export type MapMarker = {
  id: string;
  coordinate: Coordinate;
  label: string;
  kind?: VehicleKind | "person";
  active?: boolean;
};
export type RouteMapProps = {
  route: RoadRoute;
  markers: MapMarker[];
  recenter?: number;
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

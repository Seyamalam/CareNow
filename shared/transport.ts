import { z } from "zod";
import routeData from "./transport/routes.json";
import stopData from "./transport/stops.json";
export const coordinateSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);
export type Coordinate = z.infer<typeof coordinateSchema>;
export const stops = z
  .array(
    z.object({
      id: z.string(),
      name: z.string(),
      detail: z.string(),
      coordinate: coordinateSchema,
    }),
  )
  .parse(stopData);
export const vehicleKinds = [
  "ambulance",
  "accessible",
  "truck",
  "bus",
] as const;
export type VehicleKind = (typeof vehicleKinds)[number];
export const vehicles: {
  id: VehicleKind;
  name: string;
  detail: string;
  capacity: string;
  base: number;
  perKm: number;
  driver: string;
  plate: string;
  eta: number;
}[] = [
  {
    id: "ambulance",
    name: "Ambulance",
    detail: "AC · Oxygen · Stretcher",
    capacity: "1 patient + 2",
    base: 1500,
    perKm: 80,
    driver: "Rahim Ahmed",
    plate: "DEMO · AM 104",
    eta: 4,
  },
  {
    id: "accessible",
    name: "Accessible van",
    detail: "Wheelchair ramp · AC",
    capacity: "4 seats",
    base: 650,
    perKm: 45,
    driver: "Farhan Ali",
    plate: "DEMO · VN 208",
    eta: 6,
  },
  {
    id: "truck",
    name: "Pickup truck",
    detail: "Covered · 1-ton capacity",
    capacity: "1 ton",
    base: 1100,
    perKm: 60,
    driver: "Kamal Hossain",
    plate: "DEMO · TK 302",
    eta: 8,
  },
  {
    id: "bus",
    name: "Minibus",
    detail: "AC · Group transport",
    capacity: "24 seats",
    base: 2500,
    perKm: 90,
    driver: "Sajid Hasan",
    plate: "DEMO · BS 406",
    eta: 10,
  },
];
export const tripStatuses = [
  "Assigned",
  "On the way",
  "At pickup",
  "On trip",
  "Completed",
] as const;
export const tripSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  vehicle: z.enum(vehicleKinds),
  pickup: z.string(),
  destination: z.string(),
  status: z.enum([...tripStatuses, "Cancelled"]),
  fare: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Trip = z.infer<typeof tripSchema>;
export const transportActions = [
  z.object({
    type: z.literal("trip.book"),
    memberId: z.string(),
    vehicle: z.enum(vehicleKinds),
    pickup: z.string(),
    destination: z.string(),
  }),
  z.object({
    type: z.literal("trip.status"),
    id: z.string(),
    status: z.enum([
      "On the way",
      "At pickup",
      "On trip",
      "Completed",
      "Cancelled",
    ]),
  }),
] as const;
const routeSchema = z.object({
  distance: z.number().positive(),
  duration: z.number().positive(),
  coordinates: z.array(coordinateSchema).min(2),
});
export type RoadRoute = z.infer<typeof routeSchema>;
const routes = z.record(z.string(), routeSchema).parse(routeData);
export function roadRoute(from: string, to: string): RoadRoute | undefined {
  return routes[`${from}:${to}`];
}
export function quoteTrip(vehicle: VehicleKind, from: string, to: string) {
  const route = roadRoute(from, to),
    v = vehicles.find((v) => v.id === vehicle);
  if (!route || !v) return undefined;
  return {
    fare: Math.ceil((v.base + (route.distance / 1000) * v.perKm) / 50) * 50,
    distance: route.distance,
    minutes: Math.max(4, Math.ceil((route.duration / 60) * 1.6)),
  };
}
// Distance-weighted interpolation prevents short geometry segments from changing vehicle speed.
export function pointOnRoute(route: RoadRoute, progress: number): Coordinate {
  const points = route.coordinates;
  const lengths = points
    .slice(1)
    .map((p, i) =>
      Math.hypot(
        (p[0] - points[i][0]) * Math.cos((p[1] * Math.PI) / 180),
        p[1] - points[i][1],
      ),
    );
  const target =
    lengths.reduce((a, b) => a + b, 0) * Math.max(0, Math.min(1, progress));
  let traversed = 0;
  for (let i = 0; i < lengths.length; i++) {
    if (traversed + lengths[i] >= target && lengths[i] > 0) {
      const t = (target - traversed) / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * t,
        points[i][1] + (points[i + 1][1] - points[i][1]) * t,
      ];
    }
    traversed += lengths[i];
  }
  return points[points.length - 1];
}
export function routeBounds(
  route: RoadRoute,
): [number, number, number, number] {
  const xs = route.coordinates.map((p) => p[0]),
    ys = route.coordinates.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
export function approachRoute(pickup: string) {
  return roadRoute(pickup === "gulshan" ? "banani" : "gulshan", pickup)!;
}
export function stopName(id: string) {
  return stops.find((s) => s.id === id)?.name ?? id;
}

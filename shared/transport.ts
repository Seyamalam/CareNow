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
export const rideOptionsSchema = z.object({
  cargo: z.enum(["General", "Furniture", "Equipment"]).default("General"),
  truckSize: z.enum(["1 ton", "2 ton"]).default("1 ton"),
  passengers: z.number().int().min(1).max(24).default(1),
  departure: z.string().max(40).default(""),
});
export type RideOptions = z.infer<typeof rideOptionsSchema>;
export const defaultRideOptions: RideOptions = {
  cargo: "General",
  truckSize: "1 ton",
  passengers: 1,
  departure: "",
};
export const tripSchema = z.object({
  options: rideOptionsSchema.default(defaultRideOptions),
  motionStart: z.number().default(0),
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
    options: rideOptionsSchema.optional(),
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
export function quoteTrip(
  vehicle: VehicleKind,
  from: string,
  to: string,
  options: RideOptions = defaultRideOptions,
) {
  const route = roadRoute(from, to),
    v = vehicles.find((v) => v.id === vehicle);
  if (!route || !v) return undefined;
  return {
    fare:
      Math.ceil(
        (v.base +
          (route.distance / 1000) * v.perKm +
          (vehicle === "truck" && options.truckSize === "2 ton" ? 700 : 0)) /
          50,
      ) * 50,
    distance: route.distance,
    minutes: Math.max(4, Math.ceil((route.duration / 60) * 1.6)),
  };
}
// Cache cumulative distances once per immutable route; frame updates use binary search.
const routeLengths = new WeakMap<RoadRoute, number[]>();
export function pointOnRoute(route: RoadRoute, progress: number): Coordinate {
  const points = route.coordinates;
  let lengths = routeLengths.get(route);
  if (!lengths) {
    lengths = [0];
    for (let i = 1; i < points.length; i++)
      lengths.push(
        lengths[i - 1] +
          Math.hypot(
            (points[i][0] - points[i - 1][0]) *
              Math.cos((points[i][1] * Math.PI) / 180),
            points[i][1] - points[i - 1][1],
          ),
      );
    routeLengths.set(route, lengths);
  }
  const target =
    lengths[lengths.length - 1] * Math.max(0, Math.min(1, progress));
  let lo = 0,
    hi = points.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (lengths[mid] <= target) lo = mid;
    else hi = mid;
  }
  const fraction = (target - lengths[lo]) / (lengths[hi] - lengths[lo] || 1);
  return [
    points[lo][0] + (points[hi][0] - points[lo][0]) * fraction,
    points[lo][1] + (points[hi][1] - points[lo][1]) * fraction,
  ];
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

import { z } from "zod";
export const roles = [
  "customer",
  "caregiver",
  "driver",
  "doctor",
  "provider",
] as const;
export type AccountRole = (typeof roles)[number];
export const accounts: {
  id: AccountRole;
  title: string;
  name: string;
  detail: string;
}[] = [
  {
    id: "customer",
    title: "Customer",
    name: "Ayesha Rahman",
    detail: "Family · Bookings · Records",
  },
  {
    id: "caregiver",
    title: "Care professional",
    name: "Nusrat Jahan",
    detail: "Home visits · Care updates",
  },
  {
    id: "driver",
    title: "Driver",
    name: "Fleet driver",
    detail: "Ride requests · Trips",
  },
  {
    id: "doctor",
    title: "Doctor",
    name: "CareNow clinical team",
    detail: "Appointments · Consultations",
  },
  {
    id: "provider",
    title: "Service provider",
    name: "CareNow Operations",
    detail: "Assignments · Fleet · Services",
  },
];
export const jobKindSchema = z.enum(["trip", "care", "appointment"]);
export type JobKind = z.infer<typeof jobKindSchema>;
export const workspaceSchema = z.object({
  role: z.enum(roles).default("customer"),
  available: z.boolean().default(true),
  availability: z.record(z.string(), z.boolean()).default({}),
  accepted: z
    .array(
      z.object({
        id: z.string(),
        kind: jobKindSchema,
        role: z.enum(roles),
        at: z.string(),
      }),
    )
    .default([]),
});
export const clockSchema = z.object({
  anchor: z.number(),
  elapsed: z.number().default(0),
  speed: z.union([z.literal(1), z.literal(3), z.literal(8)]).default(1),
  paused: z.boolean().default(false),
});
export const exhibitionSchema = z.object({
  enabled: z.boolean().default(false),
  scenario: z.enum(["ambulance", "care", "group"]).nullable().default(null),
  clock: clockSchema,
});
export type DemoClock = z.infer<typeof clockSchema>;
export function newExhibition() {
  return {
    enabled: false,
    scenario: null,
    clock: { anchor: Date.now(), elapsed: 0, speed: 1 as const, paused: false },
  };
}
export function clockTime(clock: DemoClock, now = Date.now()) {
  return (
    clock.elapsed +
    (clock.paused ? 0 : Math.max(0, now - clock.anchor) * clock.speed)
  );
}
export const workspaceActions = [
  z.object({ type: z.literal("account.switch"), role: z.enum(roles) }),
  z.object({ type: z.literal("account.availability"), available: z.boolean() }),
  z.object({
    type: z.literal("work.accept"),
    kind: jobKindSchema,
    id: z.string(),
  }),
  z.object({ type: z.literal("work.assign"), id: z.string() }),
  z.object({
    type: z.literal("work.advance"),
    kind: jobKindSchema,
    id: z.string(),
  }),
  z.object({ type: z.literal("demo.configure"), enabled: z.boolean() }),
  z.object({
    type: z.literal("demo.clock"),
    paused: z.boolean(),
    speed: z.union([z.literal(1), z.literal(3), z.literal(8)]),
  }),
  z.object({
    type: z.literal("demo.scenario"),
    scenario: z.enum(["ambulance", "care", "group"]),
  }),
] as const;

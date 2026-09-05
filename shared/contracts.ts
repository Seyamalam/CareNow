import { z } from "zod";
import { tripSchema, transportActions } from "./transport";

import {
  workspaceSchema,
  exhibitionSchema,
  newExhibition,
  workspaceActions,
} from "./workspace";

const validDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((v) => {
    const n = new Date(v + "T12:00:00Z");
    return Number.isFinite(n.getTime()) && n.toISOString().slice(0, 10) === v;
  }, "Choose a valid calendar date");
export const memberSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2).max(60),
  age: z.number().int().min(0).max(120),
  gender: z.enum(["Female", "Male", "Other"]),
  relation: z.enum(["Self", "Mother", "Father", "Partner", "Child", "Other"]),
  blood: z.string().max(8),
  dueDate: z.union([validDate, z.literal("")]).optional(),
  allergies: z.string().max(200),
});
export const appointmentSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  doctorId: z.string(),
  date: z.string(),
  time: z.string(),
  mode: z.enum(["Video", "Audio"]),
  status: z.enum(["Confirmed", "Completed", "Cancelled"]),
  fee: z.number(),
  note: z.string(),
  createdAt: z.string(),
});
export const requestSchema = z.object({
  motionStart: z.number().default(0),
  id: z.string(),
  memberId: z.string(),
  serviceId: z.string(),
  city: z.enum(["Dhaka", "Chattogram"]),
  address: z.string(),
  contactName: z.string(),
  phone: z.string(),
  email: z.string(),
  shift: z.number(),
  days: z.number(),
  startDate: z.string(),
  price: z.number(),
  status: z.enum([
    "Requested",
    "Assigned",
    "On the way",
    "Arrived",
    "Completed",
    "Cancelled",
  ]),
  emergency: z.boolean(),
  createdAt: z.string(),
});
export const messageSchema = z.object({
  id: z.string(),
  appointmentId: z.string(),
  sender: z.enum(["You", "Care team"]),
  text: z.string(),
  attachmentId: z.string().optional(),
  createdAt: z.string(),
});
export const recordSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  title: z.string(),
  type: z.enum(["Report", "Prescription", "Consultation"]),
  date: z.string(),
  provider: z.string(),
  lines: z.array(z.string()),
});
export const logSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  kind: z.enum(["symptom", "weight", "movement", "routine"]),
  value: z.string(),
  date: z.string(),
});
export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  read: z.boolean(),
  date: z.string(),
});
export const stateSchema = z.object({
  workspace: workspaceSchema.default({
    role: "customer",
    available: true,
    availability: {},
    accepted: [],
  }),
  exhibition: exhibitionSchema.default(newExhibition),
  trips: z.array(tripSchema).default([]),
  members: z.array(memberSchema),
  appointments: z.array(appointmentSchema),
  requests: z.array(requestSchema),
  messages: z.array(messageSchema),
  records: z.array(recordSchema),
  logs: z.array(logSchema),
  notifications: z.array(notificationSchema),
  medicationEvents: z.array(z.string()),
  preferences: z.object({
    language: z.enum(["en", "bn"]),
    reminders: z.boolean(),
  }),
  version: z.number(),
});
const date = validDate;
export const actionSchema = z.discriminatedUnion("type", [
  ...transportActions,
  ...workspaceActions,
  z.object({ type: z.literal("member.save"), member: memberSchema }),
  z.object({ type: z.literal("member.delete"), id: z.string() }),
  z.object({
    type: z.literal("appointment.book"),
    memberId: z.string(),
    doctorId: z.string(),
    date,
    time: z.string(),
    mode: z.enum(["Video", "Audio"]),
    note: z.string().max(1000),
  }),
  z.object({
    type: z.literal("appointment.status"),
    id: z.string(),
    status: z.enum(["Cancelled", "Completed"]),
  }),
  z.object({
    type: z.literal("request.create"),
    memberId: z.string(),
    serviceId: z.string(),
    city: z.enum(["Dhaka", "Chattogram"]),
    address: z.string().trim().min(5).max(200),
    contactName: z.string().trim().min(2).max(60),
    phone: z
      .string()
      .regex(
        /^(?:\+?88)?01[3-9]\d{8}$/,
        "Enter a valid Bangladesh mobile number",
      ),
    email: z.union([z.string().email(), z.literal("")]),
    shift: z.union([z.literal(8), z.literal(12), z.literal(24)]),
    days: z.union([z.literal(7), z.literal(15), z.literal(30)]),
    startDate: date,
  }),
  z.object({
    type: z.literal("request.status"),
    id: z.string(),
    status: z.enum([
      "Assigned",
      "On the way",
      "Arrived",
      "Completed",
      "Cancelled",
    ]),
  }),
  z.object({
    type: z.literal("message.send"),
    appointmentId: z.string(),
    text: z.string().trim().min(1).max(2000),
    attachmentId: z.string().optional(),
  }),
  z.object({
    type: z.literal("log.add"),
    memberId: z.string(),
    kind: logSchema.shape.kind,
    value: z.string().trim().min(1).max(500),
  }),
  z.object({
    type: z.literal("medication.toggle"),
    key: z.string().min(1).max(150),
  }),
  z.object({ type: z.literal("notifications.read") }),
  z.object({
    type: z.literal("preferences.save"),
    language: z.enum(["en", "bn"]),
    reminders: z.boolean(),
  }),
]);
export type Member = z.infer<typeof memberSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type CareRequest = z.infer<typeof requestSchema>;
export type State = z.infer<typeof stateSchema>;
export type Action = z.infer<typeof actionSchema>;
export const attachmentSchema = z.object({
  name: z.string().min(1).max(100),
  mime: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  data: z
    .string()
    .min(4)
    .max(700000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/),
});
export function bangladeshDay(value: string) {
  return new Date(new Date(value).getTime() + 6 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
export function today(offset = 0) {
  const d = new Date(Date.now() + 6 * 60 * 60 * 1000);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
export function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}
export function shortDate(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

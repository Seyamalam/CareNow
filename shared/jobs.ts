import type { State } from "./contracts";
import { doctors, services } from "./catalog";
import { stopName, vehicles } from "./transport";
import type { JobKind } from "./workspace";
export type Job = {
  id: string;
  kind: JobKind;
  title: string;
  detail: string;
  status: string;
  price: number;
  member: string;
  accepted: boolean;
  next: string;
};
export function jobsFor(s: State): Job[] {
  const accepted = (kind: JobKind, id: string) =>
    s.workspace.accepted.some((a) => a.kind === kind && a.id === id);
  const name = (id: string) =>
    s.members.find((m) => m.id === id)?.name ?? "Family member";
  return [
    ...s.trips.map((t) => ({
      id: t.id,
      kind: "trip" as const,
      title: vehicles.find((v) => v.id === t.vehicle)!.name,
      detail: `${stopName(t.pickup)} → ${stopName(t.destination)}`,
      status: t.status,
      price: t.fare,
      member: name(t.memberId),
      accepted: accepted("trip", t.id),
      next:
        (
          {
            Assigned: "Start pickup",
            "On the way": "Arrive at pickup",
            "At pickup": "Start trip",
            "On trip": "Complete trip",
          } as Record<string, string>
        )[t.status] ?? "",
    })),
    ...s.requests.map((r) => ({
      id: r.id,
      kind: "care" as const,
      title: services.find((v) => v.id === r.serviceId)?.name ?? "Care visit",
      detail: r.address,
      status: r.status,
      price: r.price,
      member: name(r.memberId),
      accepted: accepted("care", r.id),
      next:
        (
          {
            Requested: "Assign care professional",
            Assigned: "Start visit journey",
            "On the way": "Mark arrived",
            Arrived: "Complete visit",
          } as Record<string, string>
        )[r.status] ?? "",
    })),
    ...s.appointments.map((a) => ({
      id: a.id,
      kind: "appointment" as const,
      title: doctors.find((d) => d.id === a.doctorId)?.name ?? "Consultation",
      detail: `${a.date} · ${a.time} · ${a.mode}`,
      status: a.status,
      price: a.fee,
      member: name(a.memberId),
      accepted: accepted("appointment", a.id),
      next: a.status === "Confirmed" ? "Complete consultation" : "",
    })),
  ];
}

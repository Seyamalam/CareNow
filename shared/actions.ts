import { type Action, type State, today } from "./contracts";
import {
  doctors,
  services,
  servicePrice,
  slots,
  medications,
  routines,
} from "./catalog";
export class ActionError extends Error {}
export function applyAction(previous: State, action: Action): State {
  const s = structuredClone(previous);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  function member(memberId: string) {
    if (!s.members.some((m) => m.id === memberId))
      throw new ActionError("Family member not found");
  }
  function notify(title: string, detail: string) {
    s.notifications.unshift({
      id: crypto.randomUUID(),
      title,
      detail,
      read: false,
      date: now,
    });
    s.notifications = s.notifications.slice(0, 50);
  }
  switch (action.type) {
    case "member.save": {
      const i = s.members.findIndex((m) => m.id === action.member.id);
      if (i < 0) {
        if (s.members.length >= 12)
          throw new ActionError("Maximum 12 family members");
        s.members.push({ ...action.member, id });
      } else s.members[i] = action.member;
      break;
    }
    case "member.delete": {
      member(action.id);
      if (s.members.length === 1)
        throw new ActionError("Keep at least one family member");
      if (
        s.appointments.some(
          (a) => a.memberId === action.id && a.status === "Confirmed",
        ) ||
        s.requests.some(
          (r) =>
            r.memberId === action.id &&
            !["Cancelled", "Completed"].includes(r.status),
        )
      )
        throw new ActionError("Cancel active care before removing this member");
      s.members = s.members.filter((m) => m.id !== action.id);
      s.records = s.records.filter((r) => r.memberId !== action.id);
      s.logs = s.logs.filter((l) => l.memberId !== action.id);
      break;
    }
    case "appointment.book": {
      member(action.memberId);
      const d = doctors.find((d) => d.id === action.doctorId);
      if (!d || !slots.includes(action.time))
        throw new ActionError("Choose an available doctor and time");
      if (action.date < today() || action.date > today(30))
        throw new ActionError("Choose a date within 30 days");
      if (
        s.appointments.some(
          (a) =>
            a.doctorId === d.id &&
            a.date === action.date &&
            a.time === action.time &&
            a.status === "Confirmed",
        )
      )
        throw new ActionError("This time is already booked");
      s.appointments.unshift({
        id,
        memberId: action.memberId,
        doctorId: d.id,
        date: action.date,
        time: action.time,
        mode: action.mode,
        note: action.note,
        status: "Confirmed",
        fee: d.fee,
        createdAt: now,
      });
      notify(
        "Appointment confirmed",
        `${d.name} · ${action.date}, ${action.time}`,
      );
      break;
    }
    case "appointment.status": {
      const a = s.appointments.find((a) => a.id === action.id);
      if (!a) throw new ActionError("Appointment not found");
      if (a.status !== "Confirmed")
        throw new ActionError("This appointment is already closed");
      a.status = action.status;
      if (a.status === "Completed") {
        s.records.unshift({
          id,
          memberId: a.memberId,
          title: "Consultation summary",
          type: "Consultation",
          date: today(),
          provider: doctors.find((d) => d.id === a.doctorId)?.name ?? "CareNow",
          lines: [
            "Simulated consultation completed",
            "Mode: " + a.mode,
            "Notes: " + (a.note || "General consultation"),
            "No diagnosis or treatment was issued in this demo.",
          ],
        });
      }
      notify(
        `Appointment ${a.status.toLowerCase()}`,
        doctors.find((d) => d.id === a.doctorId)?.name ?? "CareNow",
      );
      break;
    }
    case "request.create": {
      member(action.memberId);
      const service = services.find((x) => x.id === action.serviceId);
      if (!service) throw new ActionError("Service not found");
      if (action.startDate < today() || action.startDate > today(90))
        throw new ActionError("Choose a start date within 90 days");
      s.requests.unshift({
        id,
        memberId: action.memberId,
        serviceId: service.id,
        city: action.city,
        address: action.address,
        contactName: action.contactName,
        phone: action.phone,
        email: action.email,
        shift: action.shift,
        days: action.days,
        startDate: action.startDate,
        price: servicePrice(service, action.shift, action.days),
        status: "Requested",
        emergency: service.category === "emergency",
        createdAt: now,
      });
      notify("Care request received", service.name);
      break;
    }
    case "request.status": {
      const r = s.requests.find((r) => r.id === action.id);
      if (!r) throw new ActionError("Request not found");
      if (["Cancelled", "Completed"].includes(r.status))
        throw new ActionError("This request is already closed");
      const steps = [
        "Requested",
        "Assigned",
        "On the way",
        "Arrived",
        "Completed",
      ];
      if (
        action.status !== "Cancelled" &&
        steps.indexOf(action.status) !== steps.indexOf(r.status) + 1
      )
        throw new ActionError("Complete the previous step first");
      r.status = action.status;
      break;
    }
    case "message.send": {
      const a = s.appointments.find((a) => a.id === action.appointmentId);
      if (!a || a.status !== "Confirmed")
        throw new ActionError("Open an active appointment to send messages");
      s.messages.push({
        id,
        appointmentId: a.id,
        sender: "You",
        text: action.text,
        attachmentId: action.attachmentId,
        createdAt: now,
      });
      s.messages.push({
        id: crypto.randomUUID(),
        appointmentId: a.id,
        sender: "Care team",
        text: action.attachmentId
          ? "Demo assistant: your attachment is saved with this appointment."
          : "Demo assistant: your message is saved for this consultation.",
        createdAt: now,
      });
      break;
    }
    case "log.add": {
      member(action.memberId);
      if (
        action.kind === "weight" &&
        (!Number.isFinite(Number(action.value)) ||
          Number(action.value) < 20 ||
          Number(action.value) > 300)
      )
        throw new ActionError("Enter weight between 20 and 300 kg");
      if (
        action.kind === "movement" &&
        (!/^\d+$/.test(action.value) || Number(action.value) > 1000)
      )
        throw new ActionError("Enter a whole number between 0 and 1000");
      if (action.kind === "routine" && !routines.includes(action.value))
        throw new ActionError("Choose a listed routine");
      s.logs.unshift({
        id,
        memberId: action.memberId,
        kind: action.kind,
        value: action.value,
        date: now,
      });
      s.logs = s.logs.slice(0, 500);
      break;
    }
    case "medication.toggle": {
      const valid = s.members.some((m) =>
        medications.some(
          (med) => action.key === `${today()}:${m.id}:${med.id}`,
        ),
      );
      if (!valid) throw new ActionError("Invalid medication event");
      s.medicationEvents = s.medicationEvents.includes(action.key)
        ? s.medicationEvents.filter((k) => k !== action.key)
        : [...s.medicationEvents, action.key].slice(-300);
      break;
    }
    case "notifications.read":
      s.notifications.forEach((n) => (n.read = true));
      break;
    case "preferences.save":
      s.preferences = {
        language: action.language,
        reminders: action.reminders,
      };
      break;
  }
  s.version++;
  return s;
}

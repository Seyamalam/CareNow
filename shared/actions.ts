import { type Action, type State, today } from "./contracts";
import {
  doctors,
  services,
  servicePrice,
  slots,
  medications,
  routines,
} from "./catalog";
import {
  quoteTrip,
  tripStatuses,
  vehicles,
  defaultRideOptions,
  rideOptionsSchema,
} from "./transport";
import { clockTime, newExhibition, type AccountRole } from "./workspace";
import { initialState } from "./seed";
export class ActionError extends Error {}
export function applyAction(
  previous: State,
  action: Action,
  createId: () => string = () => crypto.randomUUID(),
): State {
  const s: State = JSON.parse(JSON.stringify(previous));
  const now = new Date().toISOString();
  const id = createId();
  function member(memberId: string) {
    if (!s.members.some((m) => m.id === memberId))
      throw new ActionError("Family member not found");
  }
  function notify(title: string, detail: string) {
    s.notifications.unshift({
      id: createId(),
      title,
      detail,
      read: false,
      date: now,
    });
    s.notifications = s.notifications.slice(0, 50);
  }
  function allow(...roles: AccountRole[]) {
    if (!roles.includes(s.workspace.role))
      throw new ActionError("Switch to the account that manages this action");
  }
  function accepted(kind: string, jobId: string) {
    return s.workspace.accepted.some(
      (a) => a.kind === kind && a.id === jobId && a.role === s.workspace.role,
    );
  }
  switch (action.type) {
    case "account.switch":
      s.workspace.availability[s.workspace.role] = s.workspace.available;
      s.workspace.available = s.workspace.availability[action.role] ?? true;
      s.workspace.role = action.role;
      break;
    case "account.availability":
      s.workspace.available = action.available;
      break;
    case "demo.configure":
      s.exhibition.enabled = action.enabled;
      break;
    case "demo.clock": {
      if (!s.exhibition.enabled)
        throw new ActionError("Open presenter mode first");
      s.exhibition.clock = {
        anchor: Date.now(),
        elapsed: clockTime(s.exhibition.clock),
        speed: action.speed,
        paused: action.paused,
      };
      break;
    }
    case "demo.scenario": {
      if (!s.exhibition.enabled)
        throw new ActionError("Open presenter mode first");
      const fresh = initialState();
      fresh.version = s.version;
      fresh.exhibition = {
        ...newExhibition(),
        enabled: true,
        scenario: action.scenario,
      };
      fresh.requests = [];
      fresh.appointments = [];
      fresh.notifications = [];
      if (action.scenario === "care") {
        const care = initialState().requests[0];
        fresh.requests = [
          { ...care, id: "scenario-care", status: "Requested", motionStart: 0 },
        ];
      } else {
        const vehicle = action.scenario === "group" ? "bus" : "ambulance";
        const destination =
          action.scenario === "group" ? "airport" : "hospital";
        fresh.trips = [
          {
            id: "scenario-trip",
            memberId: "self",
            vehicle,
            pickup: "banani",
            destination,
            status: "Assigned",
            fare: quoteTrip(vehicle, "banani", destination)!.fare,
            createdAt: now,
            updatedAt: now,
            motionStart: 0,
            options: {
              ...defaultRideOptions,
              passengers: action.scenario === "group" ? 18 : 1,
            },
          },
        ];
      }
      fresh.version++;
      return fresh;
    }
    case "work.assign": {
      allow("provider");
      const r = s.requests.find((r) => r.id === action.id);
      if (!r || r.status !== "Requested")
        throw new ActionError("Choose an unassigned care request");
      r.status = "Assigned";
      notify("Care professional assigned", "Nusrat Jahan");
      break;
    }
    case "work.accept": {
      const expected =
        action.kind === "trip"
          ? "driver"
          : action.kind === "care"
            ? "caregiver"
            : "doctor";
      allow(expected);
      if (!s.workspace.available)
        throw new ActionError("Set yourself available to accept work");
      const job =
        action.kind === "trip"
          ? s.trips.find((x) => x.id === action.id)
          : action.kind === "care"
            ? s.requests.find((x) => x.id === action.id)
            : s.appointments.find((x) => x.id === action.id);
      if (!job || ["Completed", "Cancelled"].includes(job.status))
        throw new ActionError("This job is no longer available");
      if (
        s.workspace.accepted.some(
          (a) => a.kind === action.kind && a.id === action.id,
        )
      )
        throw new ActionError("This job is already accepted");
      if (action.kind === "care" && job.status === "Requested")
        job.status = "Assigned";
      s.workspace.accepted.push({
        id: action.id,
        kind: action.kind,
        role: expected,
        at: now,
      });
      notify(
        "Request accepted",
        expected === "driver"
          ? "Your driver is preparing to leave"
          : expected === "caregiver"
            ? "Nusrat Jahan accepted your visit"
            : "Your doctor accepted the consultation",
      );
      break;
    }
    case "work.advance": {
      if (action.kind === "trip") {
        const t = s.trips.find((t) => t.id === action.id);
        const next =
          t &&
          tripStatuses[
            tripStatuses.indexOf(t.status as (typeof tripStatuses)[number]) + 1
          ];
        if (!next || next === "Assigned")
          throw new ActionError("No next trip stage");
        return applyAction(
          s,
          {
            type: "trip.status",
            id: action.id,
            status: next,
          },
          createId,
        );
      }
      if (action.kind === "appointment")
        return applyAction(
          s,
          {
            type: "appointment.status",
            id: action.id,
            status: "Completed",
          },
          createId,
        );
      const r = s.requests.find((r) => r.id === action.id);
      const stages = [
        "Requested",
        "Assigned",
        "On the way",
        "Arrived",
        "Completed",
      ] as const;
      const next =
        r && stages[stages.indexOf(r.status as (typeof stages)[number]) + 1];
      if (!next || next === "Requested")
        throw new ActionError("No next care stage");
      return applyAction(
        s,
        {
          type: "request.status",
          id: action.id,
          status: next,
        },
        createId,
      );
    }

    case "trip.book": {
      allow("customer");
      member(action.memberId);
      const options = rideOptionsSchema.parse(
        action.options ?? defaultRideOptions,
      );
      if (action.vehicle !== "bus" && options.passengers !== 1)
        throw new ActionError(
          "Passenger count is only available for minibuses",
        );
      if (
        action.vehicle !== "truck" &&
        (options.truckSize !== "1 ton" || options.cargo !== "General")
      )
        throw new ActionError("Cargo options are only available for trucks");
      if (options.departure) {
        const departure = Date.parse(options.departure);
        if (
          !Number.isFinite(departure) ||
          departure < Date.now() + 60000 ||
          departure > Date.now() + 30 * 86400000
        )
          throw new ActionError(
            "Choose a departure between one minute and 30 days from now",
          );
        if (!["bus", "truck"].includes(action.vehicle))
          throw new ActionError("Scheduling is available for trucks and buses");
      }
      const quote = quoteTrip(
        action.vehicle,
        action.pickup,
        action.destination,
        options,
      );
      if (!quote) throw new ActionError("Choose two different supported stops");
      if (s.trips.some((t) => !["Cancelled", "Completed"].includes(t.status)))
        throw new ActionError("Finish or cancel your active trip first");
      s.trips.unshift({
        id,
        memberId: action.memberId,
        options,
        motionStart: clockTime(s.exhibition.clock),
        vehicle: action.vehicle,
        pickup: action.pickup,
        destination: action.destination,
        status: "Assigned",
        fare: quote.fare,
        createdAt: now,
        updatedAt: now,
      });
      notify(
        "Transport booked",
        `${vehicles.find((v) => v.id === action.vehicle)!.name} · Demo driver assigned`,
      );
      break;
    }
    case "trip.status": {
      const trip = s.trips.find((t) => t.id === action.id);
      if (!trip) throw new ActionError("Trip not found");
      if (["Cancelled", "Completed"].includes(trip.status))
        throw new ActionError("This trip is already closed");
      const step = tripStatuses.findIndex((s) => s === trip.status);
      if (
        action.status !== "Cancelled" &&
        action.status !== tripStatuses[step + 1]
      )
        throw new ActionError("Advance one trip stage at a time");
      if (action.status === "Cancelled")
        allow("customer", "driver", "provider");
      else if (!s.exhibition.enabled) {
        allow("driver");
        if (!accepted("trip", trip.id))
          throw new ActionError("Accept this trip first");
      }
      trip.motionStart = clockTime(s.exhibition.clock);
      trip.status = action.status;
      trip.updatedAt = now;
      notify(
        `Trip ${action.status.toLowerCase()}`,
        vehicles.find((v) => v.id === trip.vehicle)!.name,
      );
      break;
    }
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
        s.trips.some(
          (t) =>
            t.memberId === action.id &&
            !["Cancelled", "Completed"].includes(t.status),
        ) ||
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
      allow("customer");
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
      if (action.status === "Cancelled")
        allow("customer", "doctor", "provider");
      else if (!s.exhibition.enabled) {
        allow("doctor");
        if (!accepted("appointment", a.id))
          throw new ActionError("Accept this appointment first");
      }
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
      allow("customer");
      member(action.memberId);
      const service = services.find((x) => x.id === action.serviceId);
      if (!service) throw new ActionError("Service not found");
      if (action.startDate < today() || action.startDate > today(90))
        throw new ActionError("Choose a start date within 90 days");
      s.requests.unshift({
        id,
        memberId: action.memberId,
        serviceId: service.id,
        motionStart: clockTime(s.exhibition.clock),
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
      if (action.status === "Cancelled")
        allow("customer", "caregiver", "provider");
      else if (!s.exhibition.enabled) {
        allow("caregiver");
        if (!accepted("care", r.id))
          throw new ActionError("Accept this visit first");
      }
      r.motionStart = clockTime(s.exhibition.clock);
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
        id: createId(),
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

import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAction } from "../shared/actions";
import { initialState } from "../shared/seed";
import { stateSchema, actionSchema } from "../shared/contracts";
import { clockTime } from "../shared/workspace";
import { defaultRideOptions } from "../shared/transport";
const booking = {
  type: "trip.book" as const,
  memberId: "self",
  vehicle: "truck" as const,
  pickup: "banani",
  destination: "hospital",
};
test("legacy sessions migrate account, clock and ride options", () => {
  const { workspace, exhibition, ...old } = initialState();
  const migrated = stateSchema.parse(old);
  assert.equal(migrated.workspace.role, "customer");
  assert.equal(migrated.exhibition.enabled, false);
  assert.equal(migrated.requests[0].motionStart, 0);
});
test("customer to driver acceptance completes the same persisted booking", () => {
  let s = applyAction(initialState(), booking);
  const id = s.trips[0].id;
  assert.throws(
    () => applyAction(s, { type: "work.accept", kind: "trip", id }),
    /account/,
  );
  assert.throws(
    () => applyAction(s, { type: "work.advance", kind: "trip", id }),
    /account/,
  );
  s = applyAction(s, { type: "account.switch", role: "driver" });
  assert.throws(
    () => applyAction(s, { type: "work.advance", kind: "trip", id }),
    /Accept/,
  );
  s = applyAction(s, { type: "work.accept", kind: "trip", id });
  assert.throws(
    () => applyAction(s, { type: "work.accept", kind: "trip", id }),
    /already/,
  );
  for (let i = 0; i < 4; i++)
    s = applyAction(s, { type: "work.advance", kind: "trip", id });
  assert.equal(s.trips[0].status, "Completed");
  assert.throws(() =>
    applyAction(s, { type: "work.advance", kind: "trip", id }),
  );
  s = applyAction(stateSchema.parse(JSON.parse(JSON.stringify(s))), {
    type: "account.switch",
    role: "customer",
  });
  assert.equal(s.trips[0].id, id);
  assert.equal(s.trips[0].status, "Completed");
});
test("provider assigns care, caregiver accepts and completes, doctor stays separate", () => {
  let s = applyAction(initialState(), {
    type: "demo.configure",
    enabled: true,
  });
  s = applyAction(s, { type: "demo.scenario", scenario: "care" });
  s = applyAction(s, { type: "demo.configure", enabled: false });
  s = applyAction(s, { type: "account.switch", role: "provider" });
  s = applyAction(s, { type: "work.assign", id: "scenario-care" });
  assert.equal(s.requests[0].status, "Assigned");
  assert.throws(() =>
    applyAction(s, { type: "work.advance", kind: "care", id: "scenario-care" }),
  );
  s = applyAction(s, { type: "account.switch", role: "caregiver" });
  s = applyAction(s, {
    type: "work.accept",
    kind: "care",
    id: "scenario-care",
  });
  for (let i = 0; i < 3; i++)
    s = applyAction(s, {
      type: "work.advance",
      kind: "care",
      id: "scenario-care",
    });
  assert.equal(s.requests[0].status, "Completed");
  assert.throws(() =>
    applyAction(s, {
      type: "work.accept",
      kind: "appointment",
      id: "welcome-appointment",
    }),
  );
});
test("unavailable professionals cannot accept or fabricate jobs", () => {
  let s = applyAction(initialState(), {
    type: "account.switch",
    role: "doctor",
  });
  s = applyAction(s, { type: "account.availability", available: false });
  assert.throws(
    () =>
      applyAction(s, {
        type: "work.accept",
        kind: "appointment",
        id: "welcome-appointment",
      }),
    /available/,
  );
  s = applyAction(s, { type: "account.availability", available: true });
  assert.throws(
    () =>
      applyAction(s, {
        type: "work.accept",
        kind: "appointment",
        id: "foreign",
      }),
    /available/,
  );
  s = applyAction(s, {
    type: "work.accept",
    kind: "appointment",
    id: "welcome-appointment",
  });
  s = applyAction(s, {
    type: "work.advance",
    kind: "appointment",
    id: "welcome-appointment",
  });
  assert.equal(s.records[0].type, "Consultation");
});
test("truck capacity pricing and bus passenger/schedule validation", () => {
  const s = applyAction(initialState(), {
    ...booking,
    options: { ...defaultRideOptions, truckSize: "2 ton", cargo: "Furniture" },
  });
  assert.equal(s.trips[0].fare, 2100);
  assert.equal(s.trips[0].options.truckSize, "2 ton");
  assert.throws(() =>
    applyAction(initialState(), {
      ...booking,
      vehicle: "ambulance",
      options: { ...defaultRideOptions, cargo: "Furniture" },
    }),
  );
  assert.equal(
    actionSchema.safeParse({
      ...booking,
      vehicle: "bus",
      options: { ...defaultRideOptions, passengers: 25 },
    }).success,
    false,
  );
  assert.throws(() =>
    applyAction(initialState(), {
      ...booking,
      options: { ...defaultRideOptions, departure: "bad" },
    }),
  );
  assert.throws(() =>
    applyAction(initialState(), {
      ...booking,
      options: {
        ...defaultRideOptions,
        departure: new Date(Date.now() - 1000).toISOString(),
      },
    }),
  );
  const departure = new Date(Date.now() + 3600000).toISOString();
  const bus = applyAction(initialState(), {
    ...booking,
    vehicle: "bus",
    options: { ...defaultRideOptions, passengers: 18, departure },
  });
  assert.equal(bus.trips[0].options.departure, departure);
});
test("presenter clock freezes without jumps and scenarios replay cleanly", () => {
  assert.equal(
    clockTime({ anchor: 100, elapsed: 200, speed: 3, paused: false }, 200),
    500,
  );
  assert.equal(
    clockTime({ anchor: 100, elapsed: 200, speed: 8, paused: true }, 9999),
    200,
  );
  let s = initialState();
  assert.throws(
    () => applyAction(s, { type: "demo.scenario", scenario: "group" }),
    /presenter/,
  );
  s = applyAction(s, { type: "demo.configure", enabled: true });
  s = applyAction(s, { type: "demo.scenario", scenario: "group" });
  assert.equal(s.trips[0].options.passengers, 18);
  s = applyAction(s, {
    type: "work.advance",
    kind: "trip",
    id: "scenario-trip",
  });
  s = applyAction(s, { type: "demo.clock", paused: true, speed: 8 });
  assert.equal(s.exhibition.clock.paused, true);
  s = applyAction(s, { type: "demo.scenario", scenario: "group" });
  assert.equal(s.trips[0].status, "Assigned");
  assert.equal(s.trips.length, 1);
  assert.equal(s.exhibition.clock.elapsed, 0);
});

test("offline mutations accept a native UUID source without global crypto", () => {
  const previous = initialState();
  let counter = 0;
  const next = applyAction(previous, booking, () => `native-${++counter}`);
  assert.match(next.trips[0].id, /native-/);
  assert.equal(previous.trips.length, 0);
  assert.equal(stateSchema.parse(next).trips.length, 1);
});
test("availability persists separately for each professional account", () => {
  let s = applyAction(initialState(), {
    type: "account.switch",
    role: "driver",
  });
  s = applyAction(s, { type: "account.availability", available: false });
  s = applyAction(s, { type: "account.switch", role: "doctor" });
  assert.equal(s.workspace.available, true);
  s = applyAction(s, { type: "account.switch", role: "driver" });
  assert.equal(s.workspace.available, false);
});

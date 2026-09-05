import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../shared/seed";
import { applyAction } from "../shared/actions";
import { stateSchema, actionSchema } from "../shared/contracts";
import {
  roadRoute,
  quoteTrip,
  pointOnRoute,
  stops,
  vehicles,
  tripStatuses,
} from "../shared/transport";
const booking = {
  type: "trip.book" as const,
  memberId: "self",
  vehicle: "ambulance" as const,
  pickup: "banani",
  destination: "hospital",
};
test("old D1 sessions gain an empty trip collection", () => {
  const { trips, ...legacy } = initialState();
  assert.deepEqual(stateSchema.parse(legacy).trips, []);
});
test("transport fare is server-derived and all demo road pairs are complete", () => {
  for (const from of stops)
    for (const to of stops) {
      if (from.id === to.id) continue;
      const r = roadRoute(from.id, to.id)!;
      assert.ok(r.coordinates.length > 10);
      assert.ok(r.distance > 0);
      assert.deepEqual(pointOnRoute(r, 0), r.coordinates[0]);
      assert.deepEqual(pointOnRoute(r, 1), r.coordinates.at(-1));
      for (const v of vehicles)
        assert.ok(quoteTrip(v.id, from.id, to.id)!.fare >= v.base);
    }
  const s = applyAction(initialState(), booking);
  assert.equal(
    s.trips[0].fare,
    quoteTrip("ambulance", "banani", "hospital")!.fare,
  );
  assert.equal(s.trips[0].status, "Assigned");
  assert.equal(initialState().trips.length, 0);
});
test("transport rejects unknown members, same stops, unsupported stops and duplicate active trips", () => {
  assert.throws(() =>
    applyAction(initialState(), { ...booking, memberId: "missing" }),
  );
  assert.throws(() =>
    applyAction(initialState(), { ...booking, destination: "banani" }),
  );
  assert.throws(() =>
    applyAction(initialState(), { ...booking, pickup: "unknown" }),
  );
  assert.throws(() =>
    applyAction(applyAction(initialState(), booking), booking),
  );
  assert.equal(
    actionSchema.safeParse({ ...booking, vehicle: "plane" }).success,
    false,
  );
});
test("transport progresses in order and closed trips cannot restart", () => {
  let s = applyAction(
    applyAction(initialState(), { type: "demo.configure", enabled: true }),
    booking,
  );
  const id = s.trips[0].id;
  assert.throws(() =>
    applyAction(s, { type: "trip.status", id, status: "Completed" }),
  );
  for (const status of tripStatuses.slice(1)) {
    if (status === "Assigned") continue;
    s = applyAction(s, { type: "trip.status", id, status });
    assert.equal(s.trips[0].status, status);
  }
  assert.throws(() =>
    applyAction(s, { type: "trip.status", id, status: "On the way" }),
  );
  assert.throws(() =>
    applyAction(s, { type: "trip.status", id, status: "Cancelled" }),
  );
  assert.equal(applyAction(s, booking).trips.length, 2);
});
test("cancellation and member protection are enforced", () => {
  let s = applyAction(initialState(), booking);
  const id = s.trips[0].id;
  assert.throws(() => applyAction(s, { type: "member.delete", id: "self" }));
  s = applyAction(s, { type: "trip.status", id, status: "Cancelled" });
  assert.throws(() =>
    applyAction(s, { type: "trip.status", id, status: "On the way" }),
  );
  assert.equal(applyAction(s, booking).trips.length, 2);
});

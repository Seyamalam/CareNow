import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../shared/seed";
import { applyAction } from "../shared/actions";
import { actionSchema, today, bangladeshDay } from "../shared/contracts";
const booking = {
  type: "appointment.book",
  memberId: "self",
  doctorId: "dr-nadia",
  date: today(2),
  time: "09:00 AM",
  mode: "Video",
  note: "",
} as const;
test("booking persists price and prevents duplicate times", () => {
  const s = applyAction(initialState(), booking);
  assert.equal(s.appointments[0].fee, 600);
  assert.equal(s.version, 1);
  assert.throws(() => applyAction(s, booking), /already booked/);
  assert.equal(initialState().appointments.length, 1);
});
test("bookings reject foreign family members", () =>
  assert.throws(
    () => applyAction(initialState(), { ...booking, memberId: "foreign" }),
    /not found/,
  ));
test("closed consultation cannot be completed twice", () => {
  let s = applyAction(
    applyAction(initialState(), { type: "demo.configure", enabled: true }),
    {
      type: "appointment.status",
      id: "welcome-appointment",
      status: "Completed",
    },
  );
  assert.equal(s.records[0].type, "Consultation");
  assert.throws(
    () =>
      applyAction(s, {
        type: "appointment.status",
        id: "welcome-appointment",
        status: "Completed",
      }),
    /closed/,
  );
});
test("care price calculated on server and transitions ordered", () => {
  let s = applyAction(initialState(), {
    type: "request.create",
    memberId: "mother",
    serviceId: "elderly-caregiver",
    city: "Dhaka",
    address: "Road 12, Dhanmondi",
    contactName: "Ayesha",
    phone: "01700000000",
    email: "",
    shift: 12,
    days: 7,
    startDate: today(1),
  });
  assert.equal(s.requests[0].price, 12600);
  assert.throws(
    () =>
      applyAction(s, {
        type: "request.status",
        id: s.requests[0].id,
        status: "Arrived",
      }),
    /previous/,
  );
  s = applyAction(s, {
    type: "request.status",
    id: s.requests[0].id,
    status: "Cancelled",
  });
  assert.equal(s.requests[0].status, "Cancelled");
});
test("medication toggles and logs validate ranges", () => {
  const key = `${today()}:self:vitamin`;
  const s = applyAction(initialState(), { type: "medication.toggle", key });
  assert(s.medicationEvents.includes(key));
  assert.equal(
    applyAction(s, { type: "medication.toggle", key }).medicationEvents.length,
    0,
  );
  assert.throws(() =>
    applyAction(s, {
      type: "log.add",
      memberId: "self",
      kind: "weight",
      value: "NaN",
    }),
  );
});
test("invalid phone and arbitrary shift rejected by shared schema", () => {
  assert.equal(
    actionSchema.safeParse({ type: "request.create", phone: "123", shift: 3 })
      .success,
    false,
  );
});

test("dates reject impossible calendar days and use Bangladesh midnight", () => {
  assert.equal(
    actionSchema.safeParse({ ...booking, date: "2026-02-30" }).success,
    false,
  );
  assert.equal(bangladeshDay("2026-09-04T20:00:00Z"), "2026-09-05");
});
test("family deletion protects active care and removes unused profiles", () => {
  assert.throws(
    () => applyAction(initialState(), { type: "member.delete", id: "self" }),
    /active care/,
  );
  let s = applyAction(initialState(), {
    type: "member.save",
    member: { ...initialState().members[0], id: "new", name: "Demo Patient" },
  });
  const id = s.members.at(-1)!.id;
  s = applyAction(s, { type: "member.delete", id });
  assert.equal(s.members.length, 3);
});
test("due date survives member edits and preferences persist", () => {
  let s = applyAction(initialState(), {
    type: "member.save",
    member: { ...initialState().members[0], dueDate: today(100) },
  });
  assert.equal(s.members[0].dueDate, today(100));
  s = applyAction(s, {
    type: "preferences.save",
    language: "bn",
    reminders: false,
  });
  assert.deepEqual(s.preferences, { language: "bn", reminders: false });
});

import { useState } from "react";
import { View } from "react-native";
import { router, Redirect } from "expo-router";
import { Switch } from "panelui-native";
import {
  ArrowRight,
  MapPin,
  ClipboardCheck,
  Navigation,
  Users,
  Stethoscope,
} from "lucide-react-native";
import { Screen, Type, Row, Box, Pill, Choice, Empty } from "../components/ui";
import { Button } from "../components/button";
import { AccountSwitcher } from "../components/account-switcher";
import { MotionArt } from "../components/motion-art";
import { useCare } from "../lib/store";
import { usePalette } from "../lib/theme";
import { jobsFor, type Job } from "../shared/jobs";
import { accounts } from "../shared/workspace";
import { money } from "../shared/contracts";
import { vehicles } from "../shared/transport";
import { VehicleArt } from "../components/vehicle-art";
function JobCard({ job, provider }: { job: Job; provider: boolean }) {
  const { act, pending } = useCare(),
    p = usePalette(),
    closed = ["Completed", "Cancelled"].includes(job.status);
  const open = () => {
    if (job.kind === "trip")
      router.push({ pathname: "/trip/[id]", params: { id: job.id } });
    else if (job.kind === "care")
      router.push({ pathname: "/care-location", params: { id: job.id } });
    else router.push({ pathname: "/consult/[id]", params: { id: job.id } });
  };
  return (
    <Box>
      <Row style={{ justifyContent: "space-between" }}>
        <Pill
          text={
            job.kind === "trip"
              ? "TRANSPORT"
              : job.kind === "care"
                ? "HOME CARE"
                : "CONSULTATION"
          }
        />
        <Type size={12} muted>
          {job.status}
        </Type>
      </Row>
      <Type size={22} weight="bold">
        {job.title}
      </Type>
      <Type size={14}>{job.member}</Type>
      <Row>
        <MapPin size={16} color={p.subtle} />
        <Type size={12} muted style={{ flex: 1 }}>
          {job.detail}
        </Type>
      </Row>
      <Row style={{ justifyContent: "space-between" }}>
        <Type size={20} weight="bold">
          {money(job.price)}
        </Type>
        <Type size={11} muted>
          {job.accepted ? "Accepted" : "Awaiting acceptance"}
        </Type>
      </Row>
      {closed ? (
        <Row>
          <MotionArt kind="success" size={46} />
          <Type size={14}>{job.status}</Type>
        </Row>
      ) : provider ? (
        <>
          {job.kind === "care" && job.status === "Requested" && (
            <Button
              loading={pending}
              onPress={() =>
                void act({ type: "work.assign", id: job.id }).catch(() => {})
              }
            >
              Assign Nusrat Jahan
            </Button>
          )}
          <Button variant="secondary" onPress={open}>
            {job.kind === "appointment" ? "View consultation" : "View location"}
          </Button>
        </>
      ) : (
        <Row>
          <Button
            variant="outline"
            onPress={open}
            startContent={
              job.kind === "appointment" ? (
                <Stethoscope size={16} />
              ) : (
                <Navigation size={16} />
              )
            }
          >
            Open
          </Button>
          <Button
            style={{ flex: 1 }}
            loading={pending}
            onPress={() =>
              void act({
                type: job.accepted ? "work.advance" : "work.accept",
                kind: job.kind,
                id: job.id,
              }).catch(() => {})
            }
            endContent={<ArrowRight size={16} />}
          >
            {job.accepted ? job.next : "Accept request"}
          </Button>
        </Row>
      )}
    </Box>
  );
}
export default function Workspace() {
  const { state, act, pending, offline } = useCare(),
    p = usePalette(),
    [history, setHistory] = useState(false),
    [filter, setFilter] = useState("all");
  const s = state!,
    role = s.workspace.role;
  if (role === "customer") return <Redirect href="/" />;
  const provider = role === "provider",
    account = accounts.find((a) => a.id === role)!,
    all = jobsFor(s).filter(
      (j) =>
        provider ||
        j.kind ===
          (role === "driver"
            ? "trip"
            : role === "caregiver"
              ? "care"
              : "appointment"),
    ),
    active = all.filter((j) => !["Completed", "Cancelled"].includes(j.status)),
    done = all.filter((j) => j.status === "Completed"),
    visible = (
      history
        ? all.filter((j) => ["Completed", "Cancelled"].includes(j.status))
        : active
    ).filter((j) => filter === "all" || j.kind === filter);
  return (
    <Screen
      title={
        provider
          ? "Operations"
          : role === "driver"
            ? "Driver desk"
            : role === "doctor"
              ? "Consultation desk"
              : "Care desk"
      }
      right={<AccountSwitcher />}
      refresh
    >
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Type size={17} weight="medium">
            {account.name}
          </Type>
          <Type size={11} muted>
            {offline ? "OFFLINE REHEARSAL" : "DHAKA · DEMO ACCOUNT"}
          </Type>
        </View>
        <Switch
          value={s.workspace.available}
          onValueChange={(available) =>
            void act({ type: "account.availability", available }).catch(
              () => {},
            )
          }
          accessibilityLabel="Available for work"
          disabled={pending}
        />
      </Row>
      <Row style={{ gap: 10, alignItems: "stretch" }}>
        {[
          [String(active.length), "Active jobs"],
          [String(done.length), "Completed"],
          [money(done.reduce((n, j) => n + j.price, 0)), "Demo earnings"],
        ].map(([value, label]) => (
          <View
            key={label}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 18,
              backgroundColor: p.card,
              borderWidth: 1,
              borderColor: p.border,
              gap: 6,
            }}
          >
            <Type
              size={21}
              weight="bold"
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              numberOfLines={1}
            >
              {value}
            </Type>
            <Type size={10} muted>
              {label}
            </Type>
          </View>
        ))}
      </Row>
      <Row>
        <Choice
          label="Active"
          selected={!history}
          onPress={() => setHistory(false)}
        />
        <Choice
          label="History"
          selected={history}
          onPress={() => setHistory(true)}
        />
        <Type size={11} muted>
          {s.workspace.available ? "Available" : "Unavailable"}
        </Type>
      </Row>
      {provider && (
        <Row style={{ flexWrap: "wrap" }}>
          {[
            ["all", "All"],
            ["trip", "Transport"],
            ["care", "Care"],
            ["appointment", "Doctors"],
          ].map(([id, label]) => (
            <Choice
              key={id}
              label={label}
              selected={filter === id}
              onPress={() => setFilter(id)}
            />
          ))}
        </Row>
      )}
      {visible.map((job) => (
        <JobCard key={`${job.kind}:${job.id}`} job={job} provider={provider} />
      ))}
      {!visible.length && (
        <Empty
          title={history ? "No completed jobs" : "No pending requests"}
          action="Presenter scenarios"
          onPress={() => router.push("/presenter")}
        />
      )}
      {provider && (
        <Box>
          <Row>
            <Users size={20} color={p.primary} />
            <Type size={18} weight="bold">
              Demo fleet
            </Type>
          </Row>
          {vehicles.map((v) => (
            <Row key={v.id}>
              <VehicleArt kind={v.id} size={54} />
              <View style={{ flex: 1 }}>
                <Type size={14} weight="medium">
                  {v.name}
                </Type>
                <Type size={11} muted>
                  {v.driver} · {v.capacity}
                </Type>
              </View>
              <Pill
                text={
                  s.trips.some(
                    (t) =>
                      t.vehicle === v.id &&
                      !["Completed", "Cancelled"].includes(t.status),
                  )
                    ? "ON JOB"
                    : "READY"
                }
              />
            </Row>
          ))}
        </Box>
      )}
      <Button
        variant="outline"
        startContent={<ClipboardCheck size={18} />}
        onPress={() => router.push("/presenter")}
      >
        Presenter controls
      </Button>
    </Screen>
  );
}

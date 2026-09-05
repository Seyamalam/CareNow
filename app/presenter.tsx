import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Switch } from "panelui-native";
import {
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  WifiOff,
  Cloud,
} from "lucide-react-native";
import { Screen, Type, Row, Box, Choice, Pill } from "../components/ui";
import { Button } from "../components/button";
import { Confirm } from "../components/confirm";
import { AccountSwitcher } from "../components/account-switcher";
import { useCare } from "../lib/store";
import { jobsFor } from "../shared/jobs";
import { usePalette } from "../lib/theme";
const scenarios = [
  {
    id: "ambulance" as const,
    title: "Ambulance pickup",
    detail: "Banani → Evercare · 1 patient",
  },
  {
    id: "care" as const,
    title: "Caregiver arrival",
    detail: "Nusrat → Dhanmondi · Elderly care",
  },
  {
    id: "group" as const,
    title: "Group transport",
    detail: "Banani → Airport · 18 passengers",
  },
];
export default function Presenter() {
  const { state, act, pending, offline, changeOffline, notify } = useCare(),
    p = usePalette(),
    [replace, setReplace] = useState<(typeof scenarios)[number]["id"] | null>(
      null,
    ),
    [busy, setBusy] = useState(false),
    s = state!,
    clock = s.exhibition.clock,
    active = jobsFor(s).filter(
      (j) => !["Completed", "Cancelled"].includes(j.status),
    );
  async function load() {
    if (!replace) return;
    try {
      if (!s.exhibition.enabled)
        await act({ type: "demo.configure", enabled: true });
      await act({ type: "demo.scenario", scenario: replace });
      setReplace(null);
    } catch {}
  }
  return (
    <Screen back title="Presenter" right={<AccountSwitcher />}>
      <Box>
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ gap: 4 }}>
            <Type size={18} weight="bold">
              Exhibition controls
            </Type>
            <Type size={12} muted>
              {s.exhibition.enabled
                ? "Simulation controls enabled"
                : "Normal account workflow"}
            </Type>
          </View>
          <Switch
            value={s.exhibition.enabled}
            onValueChange={(enabled) =>
              void act({ type: "demo.configure", enabled }).catch(() => {})
            }
            accessibilityLabel="Enable presenter controls"
          />
        </Row>
      </Box>
      <Type size={20} weight="bold">
        Ready to demonstrate
      </Type>
      {scenarios.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          accessibilityLabel={`Load ${item.title}`}
          onPress={() => setReplace(item.id)}
          style={{
            height: "auto",
            padding: 18,
            backgroundColor:
              s.exhibition.scenario === item.id ? p.mint : p.card,
            borderWidth: 1,
            borderColor: p.border,
            justifyContent: "flex-start",
          }}
        >
          <Row style={{ flex: 1 }}>
            <View style={{ flex: 1, gap: 5 }}>
              <Type size={17} weight="bold">
                {item.title}
              </Type>
              <Type size={12} muted>
                {item.detail}
              </Type>
            </View>
            <ArrowRight size={20} color={p.primary} />
          </Row>
        </Button>
      ))}
      <Box>
        <Type size={18} weight="bold">
          Playback
        </Type>
        <Row>
          <Button
            disabled={!s.exhibition.enabled}
            loading={pending}
            onPress={() =>
              void act({
                type: "demo.clock",
                paused: !clock.paused,
                speed: clock.speed,
              }).catch(() => {})
            }
            startContent={
              clock.paused ? <Play size={17} /> : <Pause size={17} />
            }
          >
            {clock.paused ? "Resume" : "Pause"}
          </Button>
          {([1, 3, 8] as const).map((speed) => (
            <Choice
              key={speed}
              label={`${speed}×`}
              selected={clock.speed === speed}
              onPress={() => {
                if (s.exhibition.enabled)
                  void act({
                    type: "demo.clock",
                    paused: clock.paused,
                    speed,
                  }).catch(() => {});
              }}
            />
          ))}
        </Row>
        <Button
          disabled={!s.exhibition.scenario}
          variant="outline"
          startContent={<RotateCcw size={16} />}
          onPress={() => setReplace(s.exhibition.scenario)}
        >
          Replay scenario
        </Button>
      </Box>
      {s.exhibition.enabled &&
        active.map((job) => (
          <Box key={job.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <Type size={17} weight="bold">
                {job.title}
              </Type>
              <Pill text={job.status} />
            </Row>
            <Button
              loading={pending}
              onPress={() =>
                void act({
                  type: "work.advance",
                  kind: job.kind,
                  id: job.id,
                }).catch(() => {})
              }
            >
              {job.next}
            </Button>
            <Button
              variant="secondary"
              onPress={() =>
                router.push(
                  job.kind === "trip"
                    ? { pathname: "/trip/[id]", params: { id: job.id } }
                    : job.kind === "care"
                      ? { pathname: "/care-location", params: { id: job.id } }
                      : { pathname: "/consult/[id]", params: { id: job.id } },
                )
              }
            >
              Show customer view
            </Button>
          </Box>
        ))}
      <Box>
        <Row>
          <WifiOff size={22} color={p.primary} />
          <Type size={18} weight="bold">
            Offline rehearsal
          </Type>
        </Row>
        <Type size={12} muted>
          Local demo data and saved route geometry. Cloud data stays separate.
        </Type>
        <Button
          variant={offline ? "primary" : "outline"}
          loading={busy}
          startContent={offline ? <Cloud size={17} /> : <WifiOff size={17} />}
          onPress={() => {
            setBusy(true);
            void changeOffline(!offline)
              .catch((e) => notify(e.message))
              .finally(() => setBusy(false));
          }}
        >
          {offline ? "Return to cloud session" : "Enter offline rehearsal"}
        </Button>
        {offline && <Pill text="OFFLINE · LOCAL ONLY" />}
      </Box>
      <Confirm
        open={!!replace}
        setOpen={(open) => {
          if (!open) setReplace(null);
        }}
        title="Load this scenario?"
        detail="Replaces the current demo bookings and resets playback in this session."
        label="Load scenario"
        loading={pending}
        onConfirm={() => void load()}
      />
    </Screen>
  );
}

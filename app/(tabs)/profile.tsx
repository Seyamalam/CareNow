import { useState } from "react";
import { View } from "react-native";
import { Switch } from "panelui-native";
import { Button } from "../../components/button";
import { router } from "expo-router";
import {
  Screen,
  Type,
  Row,
  Box,
  ListItem,
  Pill,
  Choices,
} from "../../components/ui";
import { BrandMark } from "../../components/brand";
import { Confirm } from "../../components/confirm";
import { useCare } from "../../lib/store";
import { usePalette } from "../../lib/theme";
export default function Profile() {
  const { state, act, reset, notify, t } = useCare(),
    p = usePalette();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Screen
      title={t("Your profile", "আপনার প্রোফাইল")}
      subtitle="FAMILY ACCOUNT"
    >
      <Box>
        <Row>
          <View
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              backgroundColor: p.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Type size={25} weight="bold">
              {state!.members[0].name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </Type>
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Type size={22} weight="bold">
              {state!.members[0].name}
            </Type>
            <Type size={12} muted>
              {state!.members.length} family members
            </Type>
            <Pill text="PRIVATE DEMO SESSION" />
          </View>
        </Row>
      </Box>
      <Box>
        <ListItem
          icon="user"
          title="My family"
          detail="Profiles & health information"
          onPress={() => router.push("/family")}
        />
        <ListItem
          icon="record"
          title="Health records"
          detail={`${state!.records.length} reports & summaries`}
          tone="lavender"
          onPress={() => router.push("/records")}
        />
        <ListItem
          icon="calendar"
          title="Appointments & care"
          detail="Bookings and care requests"
          tone="sand"
          onPress={() => router.push("/activity")}
        />
        <ListItem
          icon="activity"
          title="Notifications"
          detail={`${state!.notifications.filter((n) => !n.read).length} unread`}
          onPress={() => router.push("/notifications")}
        />
      </Box>
      <Box>
        <Type size={18} weight="bold">
          Preferences
        </Type>
        <Type size={13}>Navigation language</Type>
        <Choices
          values={["English", "বাংলা"]}
          value={state!.preferences.language === "en" ? "English" : "বাংলা"}
          onChange={(v) =>
            void act({
              type: "preferences.save",
              language: v === "English" ? "en" : "bn",
              reminders: state!.preferences.reminders,
            }).catch(() => {})
          }
        />
        <Row style={{ justifyContent: "space-between", paddingTop: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Type>Care reminders</Type>
            <Type size={11} muted>
              In-app reminders
            </Type>
          </View>
          <Switch
            value={state!.preferences.reminders}
            onValueChange={(v) =>
              void act({
                type: "preferences.save",
                language: state!.preferences.language,
                reminders: v,
              }).catch(() => {})
            }
          />
        </Row>
      </Box>
      <Box>
        <Row>
          <BrandMark size={35} />
          <Type size={19} weight="bold">
            CareNow
          </Type>
          <Pill text="v1.0 DEMO" />
        </Row>
        <Type size={12} muted>
          Innovation Exhibitor · Bangladesh
        </Type>
        <Type size={12} muted>
          Fictional clinical profiles. Calls, payments and service dispatch are
          simulated.
        </Type>
        <Button variant="outline" onPress={() => setConfirm(true)}>
          Start a fresh demo
        </Button>
      </Box>
      <Confirm
        open={confirm}
        setOpen={setConfirm}
        title="Start a fresh demo?"
        detail="This deletes this session’s bookings, messages and logs and restores the exhibition fixtures."
        label="Reset demo"
        loading={busy}
        onConfirm={() => {
          setBusy(true);
          void reset()
            .then(() => setConfirm(false))
            .catch((e) => notify(e.message))
            .finally(() => setBusy(false));
        }}
      />
    </Screen>
  );
}

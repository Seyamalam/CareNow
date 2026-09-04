import { useState } from "react";
import { View } from "react-native";
import { Button } from "../../components/button";
import { useLocalSearchParams } from "expo-router";
import {
  Check,
  MapPin,
  Phone,
  UserRound,
  ArrowRight,
} from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Pill,
  Empty,
  IconTile,
} from "../../components/ui";
import { Confirm } from "../../components/confirm";
import { usePalette } from "../../lib/theme";
import { useCare } from "../../lib/store";
import { services } from "../../shared/catalog";
import { type CareRequest, money, shortDate } from "../../shared/contracts";
const steps = [
  "Requested",
  "Assigned",
  "On the way",
  "Arrived",
  "Completed",
] as const;
export default function TrackRequest() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { state, act, pending } = useCare(),
    p = usePalette();
  const [cancel, setCancel] = useState(false);
  const r = state!.requests.find((x) => x.id === id);
  if (!r)
    return (
      <Screen back title="Care request">
        <Empty title="Request not found" />
      </Screen>
    );
  const service = services.find((s) => s.id === r.serviceId)!;
  const step = steps.findIndex((s) => s === r.status);
  const next = steps[step + 1];
  return (
    <Screen back title="Track your care" right={<Pill text="SIMULATION" />}>
      <Box>
        <Row>
          <IconTile
            name={r.emergency ? "ambulance" : "heart"}
            tone={r.emergency ? "sand" : "mint"}
            size={60}
          />
          <View style={{ flex: 1, gap: 5 }}>
            <Type size={22} weight="bold">
              {service.name}
            </Type>
            <Pill
              text={r.status.toUpperCase()}
              tone={r.status === "Cancelled" ? "rose" : "mint"}
            />
          </View>
        </Row>
        <Type muted size={11}>
          Request #{r.id.slice(0, 8).toUpperCase()}
        </Type>
      </Box>
      {r.status !== "Cancelled" && (
        <Box>
          {steps.map((s, i) => (
            <Row key={s} style={{ minHeight: 48 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: i <= step ? p.primary : p.muted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i <= step ? (
                  <Check size={15} color={p.onPrimary} />
                ) : (
                  <Type size={12} muted>
                    {i + 1}
                  </Type>
                )}
              </View>
              <View style={{ gap: 2, flex: 1 }}>
                <Type weight={i === step ? "bold" : "regular"} muted={i > step}>
                  {s}
                </Type>
                {i === step && (
                  <Type size={10} muted>
                    Current demo stage
                  </Type>
                )}
              </View>
            </Row>
          ))}
        </Box>
      )}
      <Box>
        <Row>
          <UserRound size={18} color={p.primary} />
          <Type>{state!.members.find((m) => m.id === r.memberId)?.name}</Type>
        </Row>
        <Row style={{ alignItems: "flex-start" }}>
          <MapPin size={18} color={p.primary} />
          <Type style={{ flex: 1 }}>
            {r.address}, {r.city}
          </Type>
        </Row>
        <Row>
          <Phone size={18} color={p.primary} />
          <Type>
            {r.contactName} · {r.phone}
          </Type>
        </Row>
        <Type muted>
          {shortDate(r.startDate)}
          {service.unit === "day"
            ? ` · ${r.shift} hrs/day · ${r.days} days`
            : ""}
        </Type>
        <Row style={{ justifyContent: "space-between" }}>
          <Type>Estimated total</Type>
          <Type size={24} weight="bold">
            {money(r.price)}
          </Type>
        </Row>
      </Box>
      {next && r.status !== "Cancelled" && (
        <>
          <Button
            fullWidth
            size="lg"
            loading={pending}
            onPress={() =>
              void act({
                type: "request.status",
                id: r.id,
                status: next === "Requested" ? "Assigned" : next,
              }).catch(() => {})
            }
            endContent={<ArrowRight size={18} />}
          >
            Simulate: {next}
          </Button>
          <Type size={11} muted style={{ textAlign: "center" }}>
            Exhibition controls · No real team is dispatched
          </Type>
        </>
      )}
      {!["Cancelled", "Completed"].includes(r.status) && (
        <Button variant="ghost" onPress={() => setCancel(true)}>
          Cancel request
        </Button>
      )}
      <Confirm
        open={cancel}
        setOpen={setCancel}
        title="Cancel care request?"
        detail={service.name}
        label="Cancel request"
        loading={pending}
        onConfirm={() =>
          void act({ type: "request.status", id: r.id, status: "Cancelled" })
            .then(() => setCancel(false))
            .catch(() => {})
        }
      />
    </Screen>
  );
}

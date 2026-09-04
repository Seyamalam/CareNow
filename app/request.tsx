import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Input } from "panelui-native";
import { Button } from "../components/button";
import { router, useLocalSearchParams } from "expo-router";
import {
  Screen,
  Type,
  Row,
  Box,
  Choices,
  Choice,
  PatientPicker,
  Pill,
  Success,
  Empty,
} from "../components/ui";
import { useCare } from "../lib/store";
import { services, servicePrice } from "../shared/catalog";
import { actionSchema, today, shortDate, money } from "../shared/contracts";
export default function Request() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const service = services.find((s) => s.id === serviceId);
  const { memberId, state, act, pending } = useCare();
  const [city, setCity] = useState<"Dhaka" | "Chattogram">("Dhaka");
  const [address, setAddress] = useState("House 12, Road 7, Dhanmondi");
  const [contactName, setContact] = useState(state!.members[0].name);
  const [phone, setPhone] = useState("01700000000");
  const [email, setEmail] = useState("");
  const [shift, setShift] = useState<8 | 12 | 24>(8);
  const [days, setDays] = useState<7 | 15 | 30>(7);
  const [startDate, setDate] = useState(today(1));
  const [confirmed, setConfirmed] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!service)
    return (
      <Screen back title="Care request">
        <Empty
          title="Choose a service"
          action="Explore care"
          onPress={() => router.replace("/care")}
        />
      </Screen>
    );
  if (confirmed)
    return (
      <Success
        title="Care request received"
        detail={`${service.name}\n${city} · ${shortDate(startDate)}`}
        label="Track your care"
        onPress={() =>
          router.replace({
            pathname: "/request/[id]",
            params: { id: confirmed },
          })
        }
      />
    );
  async function submit() {
    const result = actionSchema.safeParse({
      type: "request.create",
      serviceId: service!.id,
      memberId,
      city,
      address,
      contactName,
      phone,
      email,
      shift,
      days,
      startDate,
    });
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((i) => [String(i.path[0]), i.message]),
        ),
      );
      return;
    }
    try {
      const next = await act(result.data);
      setConfirmed(next.requests[0].id);
    } catch (e) {
      setErrors({ form: (e as Error).message });
    }
  }
  return (
    <Screen back title="Arrange care" right={<Pill text="DEMO" />}>
      <Box>
        <Type size={22} weight="bold">
          {service.name}
        </Type>
        <Type muted>{service.label}</Type>
      </Box>
      <PatientPicker />
      <View style={{ gap: 12 }}>
        <Type weight="medium">Location</Type>
        <Choices
          values={["Dhaka", "Chattogram"]}
          value={city}
          onChange={(v) => setCity(v === "Dhaka" ? "Dhaka" : "Chattogram")}
        />
      </View>
      <Input
        label="Full address"
        value={address}
        onChangeText={setAddress}
        errorMessage={errors.address}
        multiline
      />
      <View style={{ gap: 12 }}>
        <Type weight="medium">Start date</Type>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {Array.from({ length: 15 }, (_, i) => today(i)).map((d) => (
            <Choice
              key={d}
              label={shortDate(d)}
              selected={startDate === d}
              onPress={() => setDate(d)}
            />
          ))}
        </ScrollView>
      </View>
      {service.unit === "day" && (
        <>
          <View style={{ gap: 12 }}>
            <Type weight="medium">Daily shift</Type>
            <Choices
              values={["8 hours", "12 hours", "24 hours"]}
              value={`${shift} hours`}
              onChange={(v) =>
                setShift(v === "8 hours" ? 8 : v === "12 hours" ? 12 : 24)
              }
            />
          </View>
          <View style={{ gap: 12 }}>
            <Type weight="medium">Plan duration</Type>
            <Choices
              values={["7 days", "15 days", "30 days"]}
              value={`${days} days`}
              onChange={(v) =>
                setDays(v === "7 days" ? 7 : v === "15 days" ? 15 : 30)
              }
            />
          </View>
        </>
      )}
      <Input
        label="Contact name"
        value={contactName}
        onChangeText={setContact}
        errorMessage={errors.contactName}
      />
      <Input
        label="Mobile number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        errorMessage={errors.phone}
      />
      <Input
        label="Email (optional)"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        errorMessage={errors.email}
      />
      <Box>
        <Row style={{ justifyContent: "space-between" }}>
          <Type>Estimated total</Type>
          <Type size={28} weight="bold">
            {money(servicePrice(service, shift, days))}
          </Type>
        </Row>
        <Type size={11} muted>
          {service.unit === "day"
            ? `${shift} hours / day · ${days} days`
            : `One ${service.unit}`}
        </Type>
        <Pill text="DEMO · NO PAYMENT OR DISPATCH" />
      </Box>
      {errors.form && <Type selectable>{errors.form}</Type>}
      <Button fullWidth size="lg" loading={pending} onPress={submit}>
        Submit care request
      </Button>
    </Screen>
  );
}

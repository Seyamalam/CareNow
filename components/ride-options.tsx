import { View } from "react-native";
import { Input } from "panelui-native";
import { Type, Row, Choice } from "./ui";
import { Button } from "./button";
import { Minus, Plus, Settings2 } from "lucide-react-native";
import { useState } from "react";
import { BottomSheet } from "panelui-native";
import type { RideOptions as Options, VehicleKind } from "../shared/transport";
export function RideOptions({
  kind,
  value,
  onChange,
}: {
  kind: VehicleKind;
  value: Options;
  onChange: (v: Options) => void;
}) {
  const [open, setOpen] = useState(false),
    [departure, setDeparture] = useState("");
  if (!["truck", "bus"].includes(kind)) return null;
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        startContent={<Settings2 size={16} />}
        onPress={() => setOpen(true)}
      >
        {kind === "truck"
          ? `${value.truckSize} · ${value.cargo}`
          : `${value.passengers} passenger${value.passengers === 1 ? "" : "s"}`}{" "}
        · {value.departure ? "Scheduled" : "Now"}
      </Button>
      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheet.Content
          style={{ width: "100%", maxWidth: 640, alignSelf: "center" }}
        >
          <BottomSheet.Header
            title={kind === "truck" ? "Truck requirements" : "Group transport"}
          />
          <View style={{ padding: 20, gap: 20 }}>
            {kind === "truck" ? (
              <>
                <Type size={14} weight="medium">
                  Truck capacity
                </Type>
                <Row>
                  {(["1 ton", "2 ton"] as const).map((truckSize) => (
                    <Choice
                      key={truckSize}
                      label={truckSize}
                      selected={value.truckSize === truckSize}
                      onPress={() => onChange({ ...value, truckSize })}
                    />
                  ))}
                </Row>
                <Type size={14} weight="medium">
                  Cargo
                </Type>
                <Row>
                  {(["General", "Furniture", "Equipment"] as const).map(
                    (cargo) => (
                      <Choice
                        key={cargo}
                        label={cargo}
                        selected={value.cargo === cargo}
                        onPress={() => onChange({ ...value, cargo })}
                      />
                    ),
                  )}
                </Row>
              </>
            ) : (
              <Row style={{ justifyContent: "space-between" }}>
                <Type size={16}>Passengers · max 24</Type>
                <Row>
                  <Button
                    size="icon"
                    variant="outline"
                    accessibilityLabel="Fewer passengers"
                    disabled={value.passengers <= 1}
                    onPress={() =>
                      onChange({ ...value, passengers: value.passengers - 1 })
                    }
                  >
                    <Minus size={18} />
                  </Button>
                  <Type size={24} weight="bold">
                    {value.passengers}
                  </Type>
                  <Button
                    size="icon"
                    variant="outline"
                    accessibilityLabel="More passengers"
                    disabled={value.passengers >= 24}
                    onPress={() =>
                      onChange({ ...value, passengers: value.passengers + 1 })
                    }
                  >
                    <Plus size={18} />
                  </Button>
                </Row>
              </Row>
            )}
            <Type size={14} weight="medium">
              Departure · Bangladesh time
            </Type>
            <Row>
              <Choice
                label="Now"
                selected={!value.departure}
                onPress={() => {
                  setDeparture("");
                  onChange({ ...value, departure: "" });
                }}
              />
              <Choice
                label="In 1 hour"
                selected={!!value.departure}
                onPress={() => {
                  const date = new Date(Date.now() + 3600000);
                  onChange({ ...value, departure: date.toISOString() });
                  setDeparture(
                    new Date(date.getTime() + 21600000)
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " "),
                  );
                }}
              />
            </Row>
            <Input
              placeholder="YYYY-MM-DD HH:mm"
              accessibilityLabel="Scheduled departure in Bangladesh time"
              value={departure}
              onChangeText={(text) => {
                setDeparture(text);
                onChange({
                  ...value,
                  departure: text ? text.replace(" ", "T") + ":00+06:00" : "",
                });
              }}
            />
            <Type size={11} muted>
              Schedule up to 30 days ahead.
            </Type>
            <Button onPress={() => setOpen(false)}>Save ride options</Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
}

import { useState } from "react";
import { View } from "react-native";
import { BottomSheet, Input } from "panelui-native";
import { MapPin, ArrowUpDown, ChevronRight, Search } from "lucide-react-native";
import { stops, stopName } from "../shared/transport";
import { usePalette } from "../lib/theme";
import { Button } from "./button";
import { Type, Row } from "./ui";
export function StopPicker({
  pickup,
  destination,
  onChange,
}: {
  pickup: string;
  destination: string;
  onChange: (a: string, b: string) => void;
}) {
  const p = usePalette(),
    [field, setField] = useState<"pickup" | "destination" | null>(null),
    [search, setSearch] = useState("");
  return (
    <>
      <Row style={{ gap: 12 }}>
        <View style={{ alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: p.primary,
            }}
          />
          <View style={{ width: 1, height: 22, backgroundColor: p.border }} />
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: 2,
              backgroundColor: p.primary,
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          {(["pickup", "destination"] as const).map((f, i) => (
            <Button
              key={f}
              variant="ghost"
              accessibilityLabel={`Change ${f}`}
              onPress={() => {
                setSearch("");
                setField(f);
              }}
              style={{
                height: 48,
                paddingHorizontal: 0,
                justifyContent: "flex-start",
                borderRadius: 0,
                borderBottomWidth: i === 0 ? 1 : 0,
                borderBottomColor: p.border,
              }}
            >
              <Row style={{ flex: 1, justifyContent: "space-between" }}>
                <View>
                  <Type size={10} muted>
                    {i === 0 ? "PICKUP" : "DESTINATION"}
                  </Type>
                  <Type size={14} weight="medium">
                    {stopName(i === 0 ? pickup : destination)}
                  </Type>
                </View>
                <ChevronRight size={16} color={p.subtle} />
              </Row>
            </Button>
          ))}
        </View>
        <Button
          size="icon"
          variant="secondary"
          accessibilityLabel="Swap pickup and destination"
          onPress={() => onChange(destination, pickup)}
        >
          <ArrowUpDown size={18} color={p.primary} />
        </Button>
      </Row>
      <BottomSheet
        open={field !== null}
        onOpenChange={(open) => {
          if (!open) setField(null);
        }}
      >
        <BottomSheet.Content
          style={{ width: "100%", maxWidth: 640, alignSelf: "center" }}
        >
          <BottomSheet.Header
            title={field === "pickup" ? "Pickup location" : "Where to?"}
          />

          <View style={{ gap: 16, paddingBottom: 24 }}>
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search Dhaka landmarks"
              accessibilityLabel="Search locations"
            />
            <Type size={11} muted>
              DEMO SERVICE AREA · DHAKA
            </Type>
            {stops
              .filter((s) =>
                s.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((s) => {
                const disabled =
                  s.id === (field === "pickup" ? destination : pickup);
                return (
                  <Button
                    key={s.id}
                    variant="ghost"
                    disabled={disabled}
                    onPress={() => {
                      onChange(
                        field === "pickup" ? s.id : pickup,
                        field === "destination" ? s.id : destination,
                      );
                      setField(null);
                    }}
                    style={{
                      height: "auto",
                      paddingVertical: 12,
                      paddingHorizontal: 0,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Row style={{ width: "100%" }}>
                      <MapPin size={21} color={p.primary} />
                      <View style={{ flex: 1 }}>
                        <Type weight="medium">{s.name}</Type>
                        <Type size={12} muted>
                          {disabled ? "Already selected" : s.detail}
                        </Type>
                      </View>
                      <ChevronRight size={16} color={p.subtle} />
                    </Row>
                  </Button>
                );
              })}
            {!stops.some((s) =>
              s.name.toLowerCase().includes(search.toLowerCase()),
            ) && <Type muted>No matching demo locations</Type>}
          </View>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
}

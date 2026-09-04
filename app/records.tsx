import { useState } from "react";
import { View } from "react-native";
import { Button } from "panelui-native";
import { router } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import {
  Screen,
  Type,
  Row,
  Box,
  Pill,
  Choices,
  PatientPicker,
  IconTile,
  Empty,
} from "../components/ui";
import { useCare } from "../lib/store";
import { shortDate } from "../shared/contracts";
export default function Records() {
  const { state, memberId } = useCare();
  const [filter, setFilter] = useState("All");
  const list = state!.records.filter(
    (r) => r.memberId === memberId && (filter === "All" || r.type === filter),
  );
  return (
    <Screen back title="Health records">
      <PatientPicker />
      <Choices
        values={["All", "Report", "Prescription", "Consultation"]}
        value={filter}
        onChange={setFilter}
      />
      {list.length ? (
        list.map((r) => (
          <Box key={r.id}>
            <Row>
              <IconTile
                name="record"
                tone={r.type === "Prescription" ? "sand" : "lavender"}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Type weight="bold">{r.title}</Type>
                <Type size={11} muted>
                  {r.provider}
                </Type>
              </View>
            </Row>
            <Row style={{ justifyContent: "space-between" }}>
              <Pill text={`${r.type.toUpperCase()} · ${shortDate(r.date)}`} />
              <Button
                size="sm"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/record/[id]",
                    params: { id: r.id },
                  })
                }
                endContent={<ArrowUpRight size={15} />}
              >
                Open
              </Button>
            </Row>
          </Box>
        ))
      ) : (
        <Empty
          title="No records yet"
          detail="Completed consultations add a summary here."
        />
      )}
    </Screen>
  );
}

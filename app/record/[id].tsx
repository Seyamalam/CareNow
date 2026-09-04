import { View, Share } from "react-native";
import { Button } from "panelui-native";
import { useLocalSearchParams } from "expo-router";
import { Share2 } from "lucide-react-native";
import { Screen, Type, Row, Box, Pill, Empty } from "../../components/ui";
import { BrandMark } from "../../components/brand";
import { useCare } from "../../lib/store";
import { shortDate } from "../../shared/contracts";
export default function RecordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { state, notify } = useCare();
  const r = state!.records.find((x) => x.id === id);
  if (!r)
    return (
      <Screen back title="Health record">
        <Empty title="Record not found" />
      </Screen>
    );
  const member = state!.members.find((m) => m.id === r.memberId);
  return (
    <Screen back title="Health record">
      <Box>
        <Row style={{ justifyContent: "space-between" }}>
          <BrandMark size={42} />
          <Pill text="DEMO RECORD" tone="sand" />
        </Row>
        <Type size={28} weight="bold">
          {r.title}
        </Type>
        <Type muted>{r.provider}</Type>
        <Row style={{ justifyContent: "space-between" }}>
          <View>
            <Type size={10} muted>
              PATIENT
            </Type>
            <Type weight="medium">{member?.name}</Type>
          </View>
          <View>
            <Type size={10} muted>
              DATE
            </Type>
            <Type>{shortDate(r.date)}</Type>
          </View>
        </Row>
        <View style={{ gap: 17, paddingVertical: 22 }}>
          {r.lines.map((line, i) => (
            <Type key={i} selectable size={14}>
              {line}
            </Type>
          ))}
        </View>
        <Type size={10} muted>
          CareNow exhibition demo · Fictional clinical data
        </Type>
      </Box>
      <Button
        fullWidth
        variant="outline"
        startContent={<Share2 size={18} />}
        onPress={() =>
          void Share.share({
            title: r.title,
            message: `CareNow DEMO RECORD\n${r.title}\n${r.lines.join("\n")}`,
          }).catch((e) => notify(e.message))
        }
      >
        Share demo summary
      </Button>
    </Screen>
  );
}

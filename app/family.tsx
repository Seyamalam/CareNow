import { View } from "react-native";
import { Button } from "../components/button";
import { router } from "expo-router";
import { Plus, ArrowUpRight } from "lucide-react-native";
import { Screen, Type, Row, Box, Pill } from "../components/ui";
import { useCare } from "../lib/store";
import { usePalette } from "../lib/theme";
export default function Family() {
  const { state, memberId, selectMember } = useCare(),
    p = usePalette();
  return (
    <Screen
      back
      title="My family"
      right={
        <Button
          size="icon"
          variant="primary"
          accessibilityLabel="Add family member"
          onPress={() => router.push("/member")}
        >
          <Plus size={20} color={p.onPrimary} />
        </Button>
      }
    >
      {state!.members.map((m, i) => (
        <Box key={m.id}>
          <Row>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 22,
                backgroundColor: [p.mint, p.sand, p.lavender][i % 3],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Type size={24} weight="bold">
                {m.name[0]}
              </Type>
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Type size={19} weight="bold">
                {m.name}
              </Type>
              <Type size={12} muted>
                {m.relation} · {m.age} years · {m.gender}
              </Type>
            </View>
          </Row>
          <Row style={{ justifyContent: "space-between" }}>
            <Pill text={m.blood || "BLOOD GROUP —"} />
            <Row>
              <Button
                size="sm"
                variant={m.id === memberId ? "secondary" : "outline"}
                onPress={() => selectMember(m.id)}
              >
                {m.id === memberId ? "Selected" : "Select"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onPress={() =>
                  router.push({ pathname: "/member", params: { id: m.id } })
                }
              >
                Edit
              </Button>
            </Row>
          </Row>
        </Box>
      ))}
    </Screen>
  );
}

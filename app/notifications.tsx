import { View } from "react-native";
import { Button } from "panelui-native";
import { Screen, Type, Row, Box, IconTile, Empty } from "../components/ui";
import { useCare } from "../lib/store";
import { usePalette } from "../lib/theme";
export default function Notifications() {
  const { state, act, pending } = useCare(),
    p = usePalette();
  return (
    <Screen
      back
      title="Notifications"
      right={
        <Button
          variant="ghost"
          size="sm"
          loading={pending}
          onPress={() =>
            void act({ type: "notifications.read" }).catch(() => {})
          }
        >
          Read all
        </Button>
      }
    >
      {state!.notifications.length ? (
        state!.notifications.map((n) => (
          <Box key={n.id}>
            <Row style={{ alignItems: "flex-start" }}>
              <IconTile
                name="calendar"
                tone={n.read ? "muted" : "mint"}
                size={42}
              />
              <View style={{ flex: 1, gap: 6 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Type weight="bold" style={{ flex: 1 }}>
                    {n.title}
                  </Type>
                  {!n.read && (
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: p.primary,
                      }}
                    />
                  )}
                </Row>
                <Type size={12} muted>
                  {n.detail}
                </Type>
                <Type size={10} muted>
                  {new Date(n.date).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Type>
              </View>
            </Row>
          </Box>
        ))
      ) : (
        <Empty title="All caught up" />
      )}
    </Screen>
  );
}

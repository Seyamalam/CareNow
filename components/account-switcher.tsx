import { useState } from "react";
import { View, Text } from "react-native";
import { BottomSheet } from "panelui-native";
import { router } from "expo-router";
import {
  Check,
  ChevronsUpDown,
  UserRound,
  HeartHandshake,
  Navigation,
  Stethoscope,
  Building2,
  Presentation,
} from "lucide-react-native";
import { useCare } from "../lib/store";
import { usePalette } from "../lib/theme";
import { accounts, type AccountRole } from "../shared/workspace";
import { Button } from "./button";
const icons = {
  customer: UserRound,
  caregiver: HeartHandshake,
  driver: Navigation,
  doctor: Stethoscope,
  provider: Building2,
};
export function AccountSwitcher() {
  const { state, act, pending, offline } = useCare(),
    p = usePalette(),
    [open, setOpen] = useState(false);
  const account =
      accounts.find((a) => a.id === state?.workspace.role) ?? accounts[0],
    Icon = icons[account.id];
  async function choose(role: AccountRole) {
    try {
      await act({ type: "account.switch", role });
      setOpen(false);
      router.replace(role === "customer" ? "/" : "/workspace");
    } catch {}
  }
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        accessibilityLabel="Switch account type"
        onPress={() => setOpen(true)}
        startContent={<Icon size={16} />}
        endContent={<ChevronsUpDown size={14} />}
      >
        {account.id === "caregiver"
          ? "Care pro"
          : account.id === "provider"
            ? "Provider"
            : account.title}
      </Button>
      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheet.Content
          size="full"
          style={{ width: "100%", maxWidth: 640, alignSelf: "center" }}
        >
          <BottomSheet.Header
            title="Switch account"
            description={
              offline
                ? "Offline rehearsal"
                : "Exhibition accounts · Shared demo session"
            }
          />
          <BottomSheet.Body
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
          >
            {accounts.map((a) => {
              const A = icons[a.id];
              return (
                <Button
                  key={a.id}
                  variant="ghost"
                  loading={pending && a.id === account.id}
                  onPress={() => void choose(a.id)}
                  accessibilityLabel={`Use ${a.title} account`}
                  style={{
                    minHeight: 72,
                    height: "auto",
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    justifyContent: "flex-start",
                    backgroundColor: account.id === a.id ? p.mint : p.card,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      flex: 1,
                    }}
                  >
                    <A size={24} color={p.primary} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text
                        style={{
                          fontFamily: "DMSans_600SemiBold",
                          fontSize: 16,
                          color: p.ink,
                        }}
                      >
                        {a.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "DMSans_400Regular",
                          fontSize: 11,
                          color: p.subtle,
                        }}
                      >
                        {a.detail}
                      </Text>
                    </View>
                    {account.id === a.id && (
                      <Check size={18} color={p.primary} />
                    )}
                  </View>
                </Button>
              );
            })}
            <Button
              variant="outline"
              startContent={<Presentation size={18} />}
              onPress={() => {
                setOpen(false);
                router.push("/presenter");
              }}
            >
              Presenter controls
            </Button>
          </BottomSheet.Body>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
}

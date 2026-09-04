import { useState, useEffect } from "react";
import { View, Platform, ScrollView } from "react-native";
import { Button, Input } from "panelui-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  Paperclip,
  FileText,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  Screen,
  Type,
  Row,
  Box,
  Pill,
  Choices,
  Empty,
} from "../../components/ui";
import { DoctorAvatar } from "../../components/doctor-card";
import { BrandMark } from "../../components/brand";
import { useCare } from "../../lib/store";
import { usePalette } from "../../lib/theme";
import { uploadFile, getFile } from "../../lib/api";
import { doctors } from "../../shared/catalog";
export default function Consult() {
  const { id, tab: initialTab } = useLocalSearchParams<{
    id: string;
    tab?: string;
  }>();
  const { state, act, pending, notify } = useCare(),
    p = usePalette();
  const [tab, setTab] = useState(initialTab === "chat" ? "Messages" : "Call");
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const a = state!.appointments.find((x) => x.id === id),
    doctor = doctors.find((d) => d.id === a?.doctorId);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  if (!a || !doctor)
    return (
      <Screen back title="Consultation">
        <Empty title="Consultation not found" />
      </Screen>
    );
  const messages = state!.messages.filter((m) => m.appointmentId === id);
  async function send() {
    if (!text.trim()) return;
    try {
      await act({ type: "message.send", appointmentId: id, text });
      setText("");
    } catch {}
  }
  async function attach() {
    try {
      const r = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
        base64: true,
      });
      if (r.canceled) return;
      const asset = r.assets[0];
      if ((asset.size ?? 0) > 512000) {
        notify("Choose a file under 500 KB");
        return;
      }
      setUploading(true);
      const data =
        Platform.OS === "web"
          ? asset.base64
          : await new File(asset.uri).base64();
      if (!data) throw new Error("Unable to read file");
      const mime = asset.mimeType;
      if (
        mime !== "image/jpeg" &&
        mime !== "image/png" &&
        mime !== "application/pdf"
      )
        throw new Error("Choose a PDF, PNG or JPEG");
      const file = await uploadFile({
        name: asset.name,
        mime,
        data: data.replace(/^data:[^;]+;base64,/, ""),
      });
      await act({
        type: "message.send",
        appointmentId: id,
        text: asset.name,
        attachmentId: file.id,
      });
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function openFile(fileId: string) {
    try {
      const f = await getFile(fileId);
      if (Platform.OS === "web") {
        const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: f.mime }));
        window.open(url, "_blank", "noopener");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const file = new File(
          Paths.cache,
          f.name.replace(/[^a-zA-Z0-9._-]/g, "_"),
        );
        file.write(Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0)));
        await Sharing.shareAsync(file.uri, { mimeType: f.mime });
      }
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <Screen back title="Consultation" right={<Pill text="SIMULATED" />}>
      <Choices values={["Call", "Messages"]} value={tab} onChange={setTab} />
      {tab === "Call" ? (
        <>
          <View
            style={{
              minHeight: 360,
              borderRadius: 30,
              backgroundColor: p.primary,
              alignItems: "center",
              justifyContent: "center",
              gap: 17,
              padding: 24,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -65,
                top: -60,
                opacity: 0.08,
              }}
            >
              <BrandMark size={320} inverse />
            </View>
            <DoctorAvatar doctor={doctor} size={116} />
            <Type size={24} weight="bold" style={{ color: p.onPrimary }}>
              {doctor.name}
            </Type>
            <Type size={12} style={{ color: p.accent }}>
              {running
                ? "DEMO CALL IN PROGRESS"
                : a.status === "Completed"
                  ? "CALL COMPLETED"
                  : "CONSULTATION ROOM"}
            </Type>
            <Type
              size={30}
              style={{ color: p.onPrimary, fontVariant: ["tabular-nums"] }}
            >
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </Type>
            <Pill
              text={camera ? "CAMERA PREVIEW · DEMO" : "CAMERA OFF"}
              tone="mint"
            />
          </View>
          {a.status === "Confirmed" && (
            <>
              <Row style={{ justifyContent: "center", gap: 18 }}>
                <Button
                  size="icon"
                  variant={mic ? "outline" : "secondary"}
                  accessibilityLabel={
                    mic ? "Mute microphone" : "Unmute microphone"
                  }
                  onPress={() => setMic(!mic)}
                >
                  {mic ? (
                    <Mic size={21} color={p.ink} />
                  ) : (
                    <MicOff size={21} color={p.ink} />
                  )}
                </Button>
                {a.mode === "Video" && (
                  <Button
                    size="icon"
                    variant={camera ? "outline" : "secondary"}
                    accessibilityLabel={
                      camera ? "Turn camera off" : "Turn camera on"
                    }
                    onPress={() => setCamera(!camera)}
                  >
                    {camera ? (
                      <Video size={21} color={p.ink} />
                    ) : (
                      <VideoOff size={21} color={p.ink} />
                    )}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  disabled={!running}
                  loading={pending}
                  accessibilityLabel="End demo consultation"
                  onPress={() =>
                    void act({
                      type: "appointment.status",
                      id,
                      status: "Completed",
                    })
                      .then(() => {
                        setRunning(false);
                        notify("Consultation summary saved");
                        router.replace({
                          pathname: "/appointment/[id]",
                          params: { id },
                        });
                      })
                      .catch(() => {})
                  }
                >
                  <PhoneOff size={21} />
                </Button>
              </Row>
              {!running && (
                <Button fullWidth size="lg" onPress={() => setRunning(true)}>
                  Start demo call
                </Button>
              )}
            </>
          )}
          <Type size={11} muted style={{ textAlign: "center" }}>
            No live clinician, camera or microphone is connected.
          </Type>
        </>
      ) : (
        <>
          <Box>
            <Row>
              <DoctorAvatar doctor={doctor} size={46} />
              <View>
                <Type weight="bold">{doctor.name}</Type>
                <Type size={11} muted>
                  Private session · Demo assistant replies
                </Type>
              </View>
            </Row>
          </Box>
          {!messages.length && (
            <Box>
              <Type size={13} muted>
                Send visit notes or attach a report.
              </Type>
            </Box>
          )}
          {messages.map((m) => (
            <View
              key={m.id}
              style={{
                alignSelf: m.sender === "You" ? "flex-end" : "flex-start",
                maxWidth: "88%",
                backgroundColor: m.sender === "You" ? p.primary : p.card,
                padding: 17,
                borderRadius: 20,
                gap: 7,
                borderBottomRightRadius: m.sender === "You" ? 5 : 20,
                borderBottomLeftRadius: m.sender === "Care team" ? 5 : 20,
              }}
            >
              <Type
                size={10}
                style={{ color: m.sender === "You" ? p.accent : p.subtle }}
              >
                {m.sender}
              </Type>
              <Type
                size={14}
                selectable
                style={{ color: m.sender === "You" ? p.onPrimary : p.ink }}
              >
                {m.text}
              </Type>
              {m.attachmentId && (
                <Button
                  size="sm"
                  variant="secondary"
                  startContent={<FileText size={14} />}
                  onPress={() => void openFile(m.attachmentId!)}
                >
                  Open attachment
                </Button>
              )}
              <Type
                size={9}
                style={{ color: m.sender === "You" ? p.accent : p.subtle }}
              >
                {new Date(m.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Type>
            </View>
          ))}
          {a.status === "Confirmed" && (
            <Box>
              <Input
                value={text}
                onChangeText={setText}
                placeholder="Write a message"
                multiline
                maxLength={2000}
              />
              <Row style={{ justifyContent: "space-between" }}>
                <Button
                  variant="outline"
                  size="sm"
                  loading={uploading}
                  startContent={<Paperclip size={16} />}
                  onPress={attach}
                >
                  Attach
                </Button>
                <Button
                  size="sm"
                  loading={pending}
                  disabled={!text.trim()}
                  onPress={send}
                  endContent={<Send size={15} />}
                >
                  Send
                </Button>
              </Row>
              <Type size={10} muted>
                PDF, JPEG or PNG · Up to 500 KB
              </Type>
            </Box>
          )}
        </>
      )}
    </Screen>
  );
}

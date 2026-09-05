import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import {
  connect,
  getState,
  sendAction,
  resetSession,
  isOffline,
  setOffline,
} from "./api";
import type { Action, State } from "../shared/contracts";
const Data = createContext<{
  state: State | undefined;
  loading: boolean;
  fetching: boolean;
  error: Error | null;
  memberId: string;
  offline: boolean;
} | null>(null);
const Commands = createContext<{
  act: (a: Action) => Promise<State>;
  refresh: () => void;
  reset: () => Promise<void>;
  selectMember: (id: string) => void;
  notify: (text: string) => void;
  changeOffline: (value: boolean) => Promise<void>;
} | null>(null);
const Notices = createContext("");
export function CareProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient(),
    [ready, setReady] = useState(false),
    [memberId, setMemberId] = useState("self"),
    [offline, setOfflineMode] = useState(false),
    [toast, notify] = useState("");
  const q = useQuery({
    queryKey: ["care"],
    queryFn: ready ? getState : connect,
    retry: 1,
    staleTime: 30000,
  });
  useEffect(() => {
    if (q.data) {
      setReady(true);
      setOfflineMode(isOffline());
    }
  }, [q.data]);
  useEffect(() => {
    void AsyncStorage.getItem("carenow.member").then(
      (id) => id && setMemberId(id),
    );
  }, []);
  useEffect(() => {
    if (q.data && !q.data.members.some((m) => m.id === memberId))
      setMemberId(q.data.members[0].id);
  }, [q.data, memberId]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => notify(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const selectMember = useCallback((id: string) => {
    setMemberId(id);
    void AsyncStorage.setItem("carenow.member", id);
  }, []);
  const accept = useCallback(
    (next: State) => {
      qc.setQueryData<State>(["care"], (current) =>
        !current || next.version >= current.version ? next : current,
      );
    },
    [qc],
  );
  const act = useCallback(
    async (action: Action) => {
      try {
        const next = await sendAction(action);
        accept(next);
        if (
          [
            "work.accept",
            "work.advance",
            "trip.book",
            "request.create",
            "appointment.book",
          ].includes(action.type)
        )
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        return next;
      } catch (e) {
        notify((e as Error).message);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        throw e;
      }
    },
    [accept],
  );
  const refresh = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["care"] });
  }, [qc]);
  const reset = useCallback(async () => {
    const next = await resetSession();
    qc.setQueryData(["care"], next);
    selectMember("self");
    notify("New demo session ready");
  }, [qc, selectMember]);
  const changeOffline = useCallback(
    async (value: boolean) => {
      await qc.cancelQueries({ queryKey: ["care"] });
      const next = await setOffline(value);
      setOfflineMode(value);
      setReady(true);
      qc.setQueryData(["care"], next);
      selectMember("self");
    },
    [qc, selectMember],
  );
  const data = useMemo(
    () => ({
      state: q.data,
      loading: q.isLoading,
      fetching: q.isFetching,
      error: q.error,
      memberId,
      offline,
    }),
    [q.data, q.isLoading, q.isFetching, q.error, memberId, offline],
  );
  const commands = useMemo(
    () => ({ act, refresh, reset, selectMember, notify, changeOffline }),
    [act, refresh, reset, selectMember, changeOffline],
  );
  return (
    <Commands.Provider value={commands}>
      <Data.Provider value={data}>
        <Notices.Provider value={toast}>{children}</Notices.Provider>
      </Data.Provider>
    </Commands.Provider>
  );
}
export function useCare() {
  const data = useContext(Data),
    commands = useContext(Commands);
  const [pending, setPending] = useState(false),
    count = useRef(0);
  const run = commands?.act;
  const act = useCallback(
    async (action: Action) => {
      count.current++;
      setPending(true);
      try {
        return await run!(action);
      } finally {
        count.current--;
        setPending(count.current > 0);
      }
    },
    [run],
  );
  if (!data || !commands) throw new Error("CareProvider is missing");
  return {
    ...data,
    ...commands,
    act,
    pending,
    t: (en: string, bn: string) =>
      data.state?.preferences.language === "bn" ? bn : en,
  };
}
export function useNotice() {
  return useContext(Notices);
}

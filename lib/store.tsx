import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect, getState, sendAction, resetSession } from "./api";
import type { Action, State } from "../shared/contracts";
type Store = {
  state: State | undefined;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  act: (action: Action) => Promise<State>;
  pending: boolean;
  memberId: string;
  selectMember: (id: string) => void;
  toast: string;
  notify: (message: string) => void;
  reset: () => Promise<void>;
  t: (en: string, bn: string) => string;
};
const Context = createContext<Store | null>(null);
export function CareProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [memberId, setMemberId] = useState("self");
  const [toast, notify] = useState("");
  const q = useQuery({
    queryKey: ["care"],
    queryFn: ready ? getState : connect,
    retry: 1,
    staleTime: 30000,
  });
  useEffect(() => {
    if (q.data && !ready) setReady(true);
  }, [q.data, ready]);
  useEffect(() => {
    AsyncStorage.getItem("carenow.member").then((x) => x && setMemberId(x));
  }, []);
  useEffect(() => {
    if (q.data && !q.data.members.some((x) => x.id === memberId))
      setMemberId(q.data.members[0].id);
  }, [q.data, memberId]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => notify(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const mutation = useMutation({
    mutationFn: sendAction,
    onSuccess: (next) => {
      qc.setQueryData<State>(["care"], (current) =>
        !current || next.version >= current.version ? next : current,
      );
    },
    onError: (e: Error) => notify(e.message),
  });
  const selectMember = useCallback((id: string) => {
    setMemberId(id);
    void AsyncStorage.setItem("carenow.member", id);
  }, []);
  const reset = async () => {
    const next = await resetSession();
    qc.setQueryData(["care"], next);
    selectMember("self");
    notify("New demo session ready");
  };
  return (
    <Context.Provider
      value={{
        state: q.data,
        loading: q.isLoading,
        error: q.error,
        refresh: () => void q.refetch(),
        act: mutation.mutateAsync,
        pending: mutation.isPending,
        memberId,
        selectMember,
        toast,
        notify,
        reset,
        t: (en, bn) => (q.data?.preferences.language === "bn" ? bn : en),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCare() {
  const value = useContext(Context);
  if (!value) throw new Error("CareProvider is missing");
  return value;
}

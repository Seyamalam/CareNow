import { hc } from "hono/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import type { AppType } from "../server";
import {
  stateSchema,
  actionSchema,
  type State,
  type Action,
  attachmentSchema,
} from "../shared/contracts";
import { initialState } from "../shared/seed";
import { applyAction } from "../shared/actions";
let offline = false;
let offlineState: State | null = null;
let offlineQueue: Promise<unknown> = Promise.resolve();
export function isOffline() {
  return offline;
}
export async function setOffline(value: boolean): Promise<State> {
  if (value) {
    let parsed: ReturnType<typeof stateSchema.safeParse> | null = null;
    try {
      const saved = await AsyncStorage.getItem("carenow.rehearsal");
      if (saved) parsed = stateSchema.safeParse(JSON.parse(saved));
    } catch {}
    offlineState = parsed?.success ? parsed.data : initialState();
    await AsyncStorage.setItem("carenow.offline", "true");
    offline = true;
    return offlineState;
  }
  await offlineQueue;
  await AsyncStorage.setItem("carenow.offline", "false");
  offline = false;
  try {
    return await connect();
  } catch (e) {
    offline = true;
    await AsyncStorage.setItem("carenow.offline", "true");
    throw e;
  }
}
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://carenow-api.seyamalam41.workers.dev";
let token: string | null = null;
const client = hc<AppType>(API_URL, {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      return await fetch(input instanceof URL ? input.toString() : input, {
        ...init,
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(
        "Connection unavailable. Check your internet and try again.",
      );
    } finally {
      clearTimeout(timer);
    }
  },
  headers: async (): Promise<Record<string, string>> => {
    token ??= await AsyncStorage.getItem("carenow.session");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
async function check<
  R extends { ok: boolean; status: number; json: () => Promise<unknown> },
>(response: R): Promise<R> {
  if (!response.ok) {
    let message = "Connection unavailable. Try again.";
    try {
      const body = z
        .object({ error: z.unknown().optional() })
        .parse(await response.json());
      if (typeof body.error === "string") message = body.error;
      else message = "Check the form fields and try again.";
    } catch {}
    throw new ApiError(message, response.status);
  }
  return response;
}
export async function connect(): Promise<State> {
  offline = (await AsyncStorage.getItem("carenow.offline")) === "true";
  if (offline) return setOffline(true);
  token = await AsyncStorage.getItem("carenow.session");
  if (token) {
    const r = await client.api.state.$get();
    if (r.ok) return stateSchema.parse(await r.json());
    if (r.status !== 401) await check(r);
  }
  const r = await check(await client.api.session.$post());
  const data = z
    .object({ token: z.string(), state: stateSchema })
    .parse(await r.json());
  token = data.token;
  await AsyncStorage.setItem("carenow.session", token);
  return data.state;
}
export async function getState() {
  if (offline) return offlineState ?? setOffline(true);
  const response = await client.api.state.$get();
  if (response.status === 401) return connect();
  return stateSchema.parse(await (await check(response)).json());
}
export async function sendAction(action: Action) {
  if (offline) {
    const task = offlineQueue.then(async () => {
      const next = applyAction(
        offlineState ?? initialState(),
        actionSchema.parse(action),
      );
      await AsyncStorage.setItem("carenow.rehearsal", JSON.stringify(next));
      offlineState = next;
      return next;
    });
    offlineQueue = task.catch(() => {});
    return task;
  }
  return stateSchema.parse(
    await (
      await check(await client.api.actions.$post({ json: action }))
    ).json(),
  );
}
export async function resetSession() {
  if (offline) {
    offlineState = initialState();
    await AsyncStorage.setItem(
      "carenow.rehearsal",
      JSON.stringify(offlineState),
    );
    return offlineState;
  }
  await check(await client.api.session.current.$delete());
  token = null;
  await AsyncStorage.removeItem("carenow.session");
  return connect();
}
export async function uploadFile(file: z.infer<typeof attachmentSchema>) {
  if (offline) throw new ApiError("Attachments require cloud mode");
  return z
    .object({ id: z.string(), name: z.string(), mime: z.string() })
    .parse(
      await (
        await check(await client.api.attachments.$post({ json: file }))
      ).json(),
    );
}
export async function getFile(id: string) {
  if (offline) throw new ApiError("Attachments require cloud mode");
  return z
    .object({ name: z.string(), mime: z.string(), data: z.string() })
    .parse(
      await (
        await check(await client.api.attachments[":id"].$get({ param: { id } }))
      ).json(),
    );
}

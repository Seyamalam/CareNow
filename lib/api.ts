import { hc } from "hono/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import type { AppType } from "../server";
import {
  stateSchema,
  type Action,
  attachmentSchema,
} from "../shared/contracts";
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://carenow-api.seyamalam41.workers.dev";
let token: string | null = null;
const client = hc<AppType>(API_URL, {
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
export async function connect() {
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
  return stateSchema.parse(
    await (await check(await client.api.state.$get())).json(),
  );
}
export async function sendAction(action: Action) {
  return stateSchema.parse(
    await (
      await check(await client.api.actions.$post({ json: action }))
    ).json(),
  );
}
export async function resetSession() {
  await check(await client.api.session.current.$delete());
  token = null;
  await AsyncStorage.removeItem("carenow.session");
  return connect();
}
export async function uploadFile(file: z.infer<typeof attachmentSchema>) {
  return z
    .object({ id: z.string(), name: z.string(), mime: z.string() })
    .parse(
      await (
        await check(await client.api.attachments.$post({ json: file }))
      ).json(),
    );
}
export async function getFile(id: string) {
  return z
    .object({ name: z.string(), mime: z.string(), data: z.string() })
    .parse(
      await (
        await check(await client.api.attachments[":id"].$get({ param: { id } }))
      ).json(),
    );
}

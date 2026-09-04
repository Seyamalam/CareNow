import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import {
  actionSchema,
  attachmentSchema,
  stateSchema,
} from "../shared/contracts";
import { initialState } from "../shared/seed";
import { ActionError, applyAction } from "../shared/actions";
import { doctors, services } from "../shared/catalog";

type Bindings = { DB: D1Database };
type SessionRow = { id: string; state: string; version: number };
type Env = { Bindings: Bindings; Variables: { session: SessionRow } };
async function hash(token: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
const base = new Hono<Env>().basePath("/api");
base.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);
base.use(
  "*",
  bodyLimit({
    maxSize: 750000,
    onError: (c) => c.json({ error: "File is too large" }, 413),
  }),
);
base.onError((err, c) => {
  if (err instanceof ActionError) return c.json({ error: err.message }, 400);
  if (err instanceof HTTPException)
    return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: "Unable to save. Please try again." }, 500);
});
base.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  c.header("X-Content-Type-Options", "nosniff");
  if (
    c.req.path === "/api/health" ||
    c.req.path === "/api/session" ||
    c.req.path === "/api/catalog" ||
    c.req.method === "OPTIONS"
  )
    return next();
  const token = c.req.header("Authorization")?.replace(/^Bearer /, "");
  if (!token || token.length > 200)
    throw new HTTPException(401, { message: "Start a new demo session" });
  const row = await c.env.DB.prepare(
    "SELECT id,state,version FROM sessions WHERE token_hash=? AND expires_at>?",
  )
    .bind(await hash(token), new Date().toISOString())
    .first<SessionRow>();
  if (!row)
    throw new HTTPException(401, { message: "Your demo session expired" });
  c.set("session", row);
  await next();
});
const app = base
  .get("/health", async (c) => {
    await c.env.DB.prepare("SELECT 1").first();
    return c.json({ ok: true, service: "CareNow", storage: "D1", demo: true });
  })
  .get("/catalog", (c) => c.json({ doctors, services }))
  .post("/session", async (c) => {
    await c.env.DB.prepare(
      "DELETE FROM sessions WHERE id IN (SELECT id FROM sessions WHERE expires_at <= ? LIMIT 100)",
    )
      .bind(new Date().toISOString())
      .run();
    const id = crypto.randomUUID();
    const token = crypto.randomUUID() + crypto.randomUUID();
    const state = initialState();
    await c.env.DB.prepare(
      "INSERT INTO sessions(id,token_hash,state,created_at,expires_at) VALUES(?,?,?,?,?)",
    )
      .bind(
        id,
        await hash(token),
        JSON.stringify(state),
        new Date().toISOString(),
        new Date(Date.now() + 7 * 86400000).toISOString(),
      )
      .run();
    return c.json({ token, state }, 201);
  })
  .get("/state", (c) =>
    c.json(stateSchema.parse(JSON.parse(c.get("session").state))),
  )
  .post("/actions", zValidator("json", actionSchema), async (c) => {
    const action = c.req.valid("json");
    const session = c.get("session");
    if (action.type === "message.send" && action.attachmentId) {
      const file = await c.env.DB.prepare(
        "SELECT id FROM attachments WHERE id=? AND session_id=?",
      )
        .bind(action.attachmentId, session.id)
        .first();
      if (!file) throw new ActionError("Attachment not found");
    }
    let row = session;
    for (let attempt = 0; attempt < 4; attempt++) {
      const state = applyAction(
        stateSchema.parse(JSON.parse(row.state)),
        action,
      );
      const updated = await c.env.DB.prepare(
        "UPDATE sessions SET state=?,version=version+1 WHERE id=? AND version=?",
      )
        .bind(JSON.stringify(state), row.id, row.version)
        .run();
      if (updated.meta.changes === 1) return c.json(state);
      const latest = await c.env.DB.prepare(
        "SELECT id,state,version FROM sessions WHERE id=?",
      )
        .bind(row.id)
        .first<SessionRow>();
      if (!latest) throw new HTTPException(401);
      row = latest;
    }
    throw new HTTPException(409, {
      message: "Care data changed. Please try again.",
    });
  })
  .post("/attachments", zValidator("json", attachmentSchema), async (c) => {
    const body = c.req.valid("json");
    const session = c.get("session");
    const count = await c.env.DB.prepare(
      "SELECT COUNT(*) AS total FROM attachments WHERE session_id=?",
    )
      .bind(session.id)
      .first<{ total: number }>();
    if ((count?.total ?? 0) >= 20)
      throw new ActionError("Maximum 20 attachments per demo");
    const bytes = atob(body.data);
    const valid =
      body.mime === "application/pdf"
        ? bytes.startsWith("%PDF-")
        : body.mime === "image/png"
          ? bytes.startsWith("\x89PNG\r\n\x1a\n")
          : bytes.startsWith("\xff\xd8\xff");
    if (!valid) throw new ActionError("File contents do not match its type");
    const id = crypto.randomUUID();
    await c.env.DB.prepare("INSERT INTO attachments VALUES(?,?,?,?,?,?)")
      .bind(
        id,
        session.id,
        body.name,
        body.mime,
        body.data,
        new Date().toISOString(),
      )
      .run();
    return c.json({ id, name: body.name, mime: body.mime }, 201);
  })
  .get("/attachments/:id", async (c) => {
    const file = await c.env.DB.prepare(
      "SELECT name,mime,data FROM attachments WHERE id=? AND session_id=?",
    )
      .bind(c.req.param("id"), c.get("session").id)
      .first<{ name: string; mime: string; data: string }>();
    if (!file) throw new HTTPException(404);
    return c.json(file);
  })
  .delete("/session/current", async (c) => {
    await c.env.DB.prepare("DELETE FROM sessions WHERE id=?")
      .bind(c.get("session").id)
      .run();
    return c.json({ ok: true });
  });
export type AppType = typeof app;
export default app;

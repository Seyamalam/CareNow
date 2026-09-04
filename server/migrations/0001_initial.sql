CREATE TABLE sessions (
 id TEXT PRIMARY KEY,
 token_hash TEXT NOT NULL UNIQUE,
 state TEXT NOT NULL CHECK(json_valid(state)),
 version INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 expires_at TEXT NOT NULL
);
CREATE INDEX sessions_expiration ON sessions(expires_at);
CREATE TABLE attachments (
 id TEXT PRIMARY KEY,
 session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 mime TEXT NOT NULL,
 data TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX attachments_session ON attachments(session_id);

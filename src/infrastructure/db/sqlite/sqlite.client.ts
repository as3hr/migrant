import { Database } from "bun:sqlite";

export const sqlLite: Database = new Database('migrant.db');

// done
sqlLite.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      user_id TEXT PRIMARY KEY,
      session_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// done
sqlLite.run(`
  CREATE TABLE IF NOT EXISTS databases (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    connectionStringKey TEXT,
    schemaFingerprint TEXT,
    type TEXT,
    lastScannedAt DATETIME,
    indexStatus TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// done
sqlLite.run(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    session_token_limit BIGINT NOT NULL DEFAULT 100000,
    session_token_used BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// done
sqlLite.run(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    content TEXT NOT NULL,
    provider TEXT NOT NULL,
    role TEXT NOT NULL,
    model_name TEXT NOT NULL,
    target_agent TEXT NOT NULL,
    prompt_tokens BIGINT NOT NULL DEFAULT 0,
    completion_tokens BIGINT NOT NULL DEFAULT 0,
    total_tokens BIGINT NOT NULL DEFAULT 0,
    cost_usd REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// done
sqlLite.run(`
  CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    api_key_env TEXT NOT NULL
  );
`);
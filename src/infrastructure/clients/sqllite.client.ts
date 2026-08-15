import Database from 'better-sqlite3';

export const sqlLite: Database.Database = new Database('migrant.db');
sqlLite.pragma('journal_mode = WAL');

sqlLite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      user_id TEXT PRIMARY KEY,
      session_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

sqlLite.exec(`
  CREATE TABLE IF NOT EXISTS databases (
    db_id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    connection_string_key TEXT,
    type TEXT,
    last_scanned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
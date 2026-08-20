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
    schema_fingerprint TEXT,
    type TEXT,
    last_scanned_at DATETIME,
    index_status TEXT,
    index_version INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Idempotent schema migrations — each ALTER is isolated so a
// "no such column" or "duplicate column" error on one doesn't block others.
const alterStatements = [
  `ALTER TABLE databases DROP COLUMN migrations;`,
  `ALTER TABLE databases ADD COLUMN schema_fingerprint TEXT;`,
  `ALTER TABLE databases ADD COLUMN index_status TEXT;`,
  `ALTER TABLE databases ADD COLUMN index_version INT;`,
];

for (const stmt of alterStatements) {
  try {
    sqlLite.exec(stmt);
  } catch (_e) {
    // Ignore — column already exists / doesn't exist
  }
}
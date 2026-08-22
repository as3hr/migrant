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

// const stmts = [
  // `ALTER TABLE databases DROP COLUMN indexVersion`,
// ];

// for (const stmt of stmts) {
//   try {
//     sqlLite.exec(stmt);
//   } catch (_e) {}
// }
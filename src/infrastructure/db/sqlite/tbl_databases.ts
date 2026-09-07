import type { DatabaseCollection, DatabaseType } from "../../../domain/index.ts";
import { credentialStore } from "../../security/credential_store.ts";
import { sqlClient } from "./sqlite.client.ts";

class TblDatabases {
    private databasesDbSelectStmt: any;
    private databasesDbInsertStmt: any;
    private databasesDbDeleteStmt: any;
    private databasesDbSelectByIdStmt: any;

    initializeTblDatabases() {
        sqlClient.run(`
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

        this.databasesDbInsertStmt = sqlClient.prepare(
            'INSERT OR REPLACE INTO databases (id, userId, name, connectionStringKey, schemaFingerprint, type, lastScannedAt, indexStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        this.databasesDbSelectStmt = sqlClient.prepare(
            'SELECT * FROM databases WHERE userId = ?'
        );
        this.databasesDbDeleteStmt = sqlClient.prepare(
            'DELETE FROM databases WHERE id = ?'
        );
        this.databasesDbSelectByIdStmt = sqlClient.prepare(
            'SELECT * FROM databases WHERE id = ?'
        );
    }

    async setLocalDb(db: DatabaseCollection, userId: string): Promise<void> { 
        const existingDb = await this.getLocalDbById(db.id);
        if (existingDb) {
            this.deleteLocalWorkspaceDb(db.id);   
        }
        
        const lastScannedStr = db.lastScannedAt ? db.lastScannedAt.toISOString() : null;
        await credentialStore.set(
          db.connectionStringKey,
          db.connectionString
        );
        this.databasesDbInsertStmt.run(
            db.id, 
            userId, 
            db.name, 
            db.connectionStringKey,
            db.schemaFingerprint,
            db.type, 
            lastScannedStr,
            db.indexStatus,
        );
    }

    async getLocalDbs(user_id: string): Promise<DatabaseCollection[]> {
        const rows = this.databasesDbSelectStmt.all(user_id) as DatabaseCollection[];
        const data = await Promise.all(
            rows.map(async (row) => {
              const value = await credentialStore.get(row.connectionStringKey);
          
              if (!value) return null;
          
              return {
                id: row.id,
                userId: row.userId,
                name: row.name,
                connectionString: value,
                connectionStringKey: row.connectionStringKey,
                type: row.type as DatabaseType,
                schemaFingerprint: row.schemaFingerprint,
                lastScannedAt: row.lastScannedAt
                  ? new Date(row.lastScannedAt)
                  : undefined,
                indexStatus: row.indexStatus as 'none' | 'indexing' | 'ready' | 'failed',
              };
            })
        );;
        return data.filter((row) => row != null);
    }


    async getLocalDbById(id: string): Promise<DatabaseCollection | null> {
        const row = this.databasesDbSelectByIdStmt.get(id) as DatabaseCollection;
        if (!row) return null;
        const value = await credentialStore.get(row.connectionStringKey);
        if (!value) return null;
        return {
            id: row.id,
            userId: row.userId,
            name: row.name,
            connectionString: value,
            connectionStringKey: row.connectionStringKey,
            type: row.type as DatabaseType,
            schemaFingerprint: row.schemaFingerprint,
            lastScannedAt: row.lastScannedAt
              ? new Date(row.lastScannedAt)
              : undefined,
            indexStatus: row.indexStatus as 'none' | 'indexing' |'ready' | 'failed',
        }
    }

    getLocalDbsConnectionKeys(user_id: string): string[] {
        const rows = this.databasesDbSelectStmt.all(user_id) as DatabaseCollection[];
        return rows.map((row) => row.connectionStringKey);
    }

    deleteLocalWorkspaceDb(id: string): boolean {
        const info = this.databasesDbDeleteStmt.run(id);
        return info.changes > 0;
    }
}


export const tblDatabases = new TblDatabases();
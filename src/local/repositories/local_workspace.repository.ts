import { type DatabaseCollection, type DatabaseType } from "@src/exports.ts";
import { sqlLite } from "@src/infrastructure/clients/sqllite.client.ts";
import { credentialStore } from "@src/infrastructure/security/credential_store.ts";

export class LocalWorkspaceRepository {
    private workspaceDbSelectStmt;
    private workspaceDbInsertStmt;
    private workspaceDbDeleteStmt;
    
    constructor() {
        this.workspaceDbInsertStmt = sqlLite.prepare(
            'INSERT OR REPLACE INTO databases (id, userId, name, connectionStringKey, schemaFingerprint, type, lastScannedAt, indexStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        this.workspaceDbSelectStmt = sqlLite.prepare(
            'SELECT * FROM databases WHERE userId = ?'
        );
        this.workspaceDbDeleteStmt = sqlLite.prepare(
            'DELETE FROM databases WHERE id = ?'
        );
    }

    async setLocalDb(db: DatabaseCollection, userId: string): Promise<void> { 
        const lastScannedStr = db.lastScannedAt ? db.lastScannedAt.toISOString() : null;
        await credentialStore.set(
          db.connectionStringKey,
          db.connectionString
        );

        this.workspaceDbInsertStmt.run(
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
        const rows = this.workspaceDbSelectStmt.all(user_id) as DatabaseCollection[];
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
        );
        const uniqueData = Array.from(new Set(data));
        return uniqueData.filter((row) => row != null);
    }

    getLocalDbsConnectionKeys(user_id: string): string[] {
        const rows = this.workspaceDbSelectStmt.all(user_id) as DatabaseCollection[];
        const uniqueData = Array.from(new Set(rows));
        const data = uniqueData.map((row) => row.connectionStringKey);
        return data;
    }

    deleteLocalWorkspaceDb(id: string): boolean {
        const info = this.workspaceDbDeleteStmt.run(id);
        return info.changes > 0;
    }
}

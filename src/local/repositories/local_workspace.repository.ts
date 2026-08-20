import { type DatabaseCollection, type DatabaseType } from "@src/exports.ts";
import { sqlLite } from "@src/infrastructure/clients/sqllite.client.ts";
import { credentialStore } from "@src/infrastructure/security/credential_store.ts";

interface WorkspaceRow {
    db_id: string;
    user_id: string;
    name: string;
    connection_string_key: string;
    type: string;
    schema_fingerprint: string | null;
    last_scanned_at?: string | null; 
    index_status: string;
    index_version: number;
}

export class LocalWorkspaceRepository {
    private workspaceDbSelectStmt;
    private workspaceDbInsertStmt;
    private workspaceDbDeleteStmt;
    
    constructor() {
        this.workspaceDbInsertStmt = sqlLite.prepare(
            'INSERT OR REPLACE INTO databases (db_id, user_id, name, connection_string_key, schema_fingerprint, type, last_scanned_at, index_status, index_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        this.workspaceDbSelectStmt = sqlLite.prepare(
            'SELECT * FROM databases WHERE user_id = ?'
        );
        this.workspaceDbDeleteStmt = sqlLite.prepare(
            'DELETE FROM databases WHERE db_id = ?'
        );
    }

    async setWorkspaceDb(db: DatabaseCollection, userId: string): Promise<void> { 
        const lastScannedStr = db.lastScannedAt ? db.lastScannedAt.toISOString() : null;
        const connectionStringKey = `database-${db.id}`;
        await credentialStore.set(
          connectionStringKey,
          db.connectionString
        );

        this.workspaceDbInsertStmt.run(
            db.id, 
            userId, 
            db.name, 
            connectionStringKey,
            db.schemaFingerprint,
            db.type, 
            lastScannedStr,
            db.indexStatus,
            db.indexVersion,
        );
    }

    async getWorkspaceDbs(user_id: string): Promise<DatabaseCollection[]> {
        const rows = this.workspaceDbSelectStmt.all(user_id) as WorkspaceRow[];
        const data = await Promise.all(
            rows.map(async (row) => {
              const value = await credentialStore.get(row.connection_string_key);
          
              if (!value) return null;
          
              return {
                id: row.db_id,
                name: row.name,
                connectionString: value,
                type: row.type as DatabaseType,
                schemaFingerprint: row.schema_fingerprint,
                lastScannedAt: row.last_scanned_at
                  ? new Date(row.last_scanned_at)
                  : undefined,
                indexStatus: row.index_status as 'none' | 'indexing' | 'ready' | 'failed',
                indexVersion: row.index_version,
              };
            })
        );
        return data.filter((row) => row != null);
    }

    getDbsConnectionKeys(user_id: string): string[] {
        const rows = this.workspaceDbSelectStmt.all(user_id) as WorkspaceRow[];
        const data = rows.map((row) => row.connection_string_key);
        return data;
    }

    deleteWorkspaceDb(id: string): boolean {
        const info = this.workspaceDbDeleteStmt.run(id);
        return info.changes > 0;
    }
}

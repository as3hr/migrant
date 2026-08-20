import { getDbName, getSchemaFingerprint, LocalSessionRepository } from "@src/exports.ts";
import { LocalWorkspaceRepository } from "@src/local/repositories/local_workspace.repository.ts";

export type DatabaseType = "postgres" | "my-sql" | "mongodb";

export interface DatabaseCollection { 
    id: string;
    name: string;
    connectionString: string;
    type: DatabaseType;
    schemaFingerprint: string | null;
    lastScannedAt?: Date | undefined;
    indexStatus: 'none' | 'indexing' | 'ready' | 'failed';
    indexVersion: number; 
}

export class WorkSpace { 
    databases: DatabaseCollection[] = [];
    private repo: LocalWorkspaceRepository;
    private sessionRepo: LocalSessionRepository;

    constructor() {
        this.repo = new LocalWorkspaceRepository();
        this.sessionRepo = new LocalSessionRepository();
        this.getWorkspaceFromCache();
    }

    async getWorkspaceFromCache() {
        const row = this.sessionRepo.getUserSession();
        if (!row) return;
        const data = await this.repo.getWorkspaceDbs(row.user_id);
        this.databases = data;
    }

    async addDbToWorkspace(dbUrl: string, dbId: string) {
        const row = this.sessionRepo.getUserSession();
        const schemaFingerPrint = await getSchemaFingerprint();
        if (!row) return;
        if (this.dbExists(dbUrl)) {
            this.removeDbFromWorkSpace(dbId);
        }
        const newDb: DatabaseCollection = {
            id: dbId,
            name: getDbName(dbUrl),
            connectionString: dbUrl,
            type: "postgres",
            schemaFingerprint: schemaFingerPrint,
            indexStatus: 'none',
            indexVersion: 1,
        };
        this.databases.push(newDb);    
        await this.repo.setWorkspaceDb(newDb, row.user_id);
    }

    removeDbFromWorkSpace(dbId: string): void {
        this.databases = this.databases.filter((db) => db.id !== dbId);
        this.repo.deleteWorkspaceDb(dbId);
    }

    updateDb(dbId: string, dbData?: Partial<DatabaseCollection>): void {
        const row = this.sessionRepo.getUserSession();
        if (!row) return;
        this.databases = this.databases.map((db) => {
            if (db.id === dbId) {
                const updatedDb = {
                    ...db,
                    ...dbData,
                };
                
                this.repo.setWorkspaceDb(updatedDb, row.user_id);
                return updatedDb;
            }
            return db;
        });        
    }

    dbExists(dbUrl: string): boolean {
        return this.databases.some((db) => db.connectionString === dbUrl);
    }
}

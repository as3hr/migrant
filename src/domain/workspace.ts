import { getDbName, LocalSessionRepository } from "@src/exports.ts";
import { LocalWorkspaceRepository } from "@src/local/repositories/local_workspace.repository.ts";

export type DatabaseType = "postgres" | "my-sql" | "mongodb";

export interface DatabaseCollection { 
    id: string;
    name: string;
    connectionString: string;
    type: DatabaseType;
    lastScannedAt?: Date | undefined;
}

export class WorkSpace { 
    activeDbId: string = '';
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
        if (!row) return;
        const newDb: DatabaseCollection = {
            id: dbId,
            name: getDbName(dbUrl),
            connectionString: dbUrl,
            type: "postgres",
        };
        this.databases.push(newDb);    
        await this.repo.setWorkspaceDb(newDb, row.user_id);
    }

    setActiveDbId(dbId: string): void {
        this.activeDbId = dbId;
    }

    removeDbFromWorkSpace(dbId: string): void {
        this.databases = this.databases.filter((db) => db.id !== dbId);
        this.repo.deleteWorkspaceDb(dbId);
    }

    setLastScanTimeOfDb(dbId: string): void {
        const row = this.sessionRepo.getUserSession();
        if (!row) return;
        this.databases = this.databases.map((db) => {
            if (db.id === dbId) {
                const updatedDb = {
                    ...db,
                    lastScannedAt: new Date()
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

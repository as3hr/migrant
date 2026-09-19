import { pool, tblDatabases, tblUserSession } from "../infrastructure/index.ts";

export type DatabaseType = "postgres" | "my-sql" | "mongodb";

export interface DatabaseCollection { 
    id: string;
    userId: string;
    name: string;
    type: DatabaseType;
    connectionString: string;
    connectionStringKey: string;
    schemaFingerprint: string | null;
    indexStatus: 'none' | 'indexing' | 'ready' | 'failed';
    lastScannedAt?: Date | undefined;
}

export class WorkSpace { 
    databases: DatabaseCollection[] = [];
    activeDbs: DatabaseCollection[] = [];

    constructor() {
        this.loadFromCache();
    }

    setActiveDbs(dbs: DatabaseCollection[]) {
        this.activeDbs = dbs;
    }

    clearActiveDbs() {
        this.activeDbs = [];
    }

    getActiveDbs(): DatabaseCollection[] | null {
        const dbs = this.activeDbs.length > 0 ? this.activeDbs : this.databases;
        return dbs.length == 0 ? null : dbs;
    }

    async loadFromCache(): Promise<void> {
        const row = tblUserSession.getUserSession();
        if (!row) return;
        const dbs = await tblDatabases.getLocalDbs(row.user_id);
        this.databases = dbs;
        this.activeDbs = dbs;
        await this.warmUpPool();
    }

    async warmUpPool() {
        await Promise.all(this.activeDbs.map(db => pool.setConnection(db.connectionString)));
    }

    addDbToWorkspace(db: DatabaseCollection): void {
        this.databases.push(db);
    }

    async updateDb(dbId: string, patch: Partial<DatabaseCollection>): Promise<void> {
        const row = tblUserSession.getUserSession();
        const updatedList = await Promise.all(
            this.databases.map(async (db) => {
                if (db.id !== dbId) return db;
                const updated = { ...db, ...patch };
                if (row) {
                    await tblDatabases.setLocalDb(updated, row.user_id);
                }
                return updated;
            })
        );
        this.databases = updatedList;
    }

    removeDbFromWorkspace(dbId: string): void {
        this.databases = this.databases.filter((db) => db.id !== dbId);
        tblDatabases.deleteLocalWorkspaceDb(dbId);
    }

    getDb(dbId: string): DatabaseCollection | undefined {
        return this.databases.find((db) => db.id === dbId);
    }

    dbExists(dbUrl: string): boolean {
        return this.databases.some((db) => db.connectionString === dbUrl);
    }
}

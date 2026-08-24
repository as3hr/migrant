import { LocalSessionRepository, LocalWorkspaceRepository, pool } from "@src/exports.ts";

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

/**
 * WorkSpace — pure in-memory runtime state for the connected databases.
 *
 * WorkSpace does NOT call Supabase.
 * WorkSpace does NOT decide when to persist — that is DatabaseRegistryService's job.
 *
 * Public persistence API (persistDb) is called explicitly by DatabaseRegistryService
 * so that all three stores update together.
 */
export class WorkSpace { 
    databases: DatabaseCollection[] = [];
    activeDbs: DatabaseCollection[] = [];
    private repo: LocalWorkspaceRepository;
    private sessionRepo: LocalSessionRepository;

    constructor() {
        this.repo = new LocalWorkspaceRepository();
        this.sessionRepo = new LocalSessionRepository();
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

    /** Restore workspace databases from SQLite on startup. */
    async loadFromCache(): Promise<void> {
        const row = this.sessionRepo.getUserSession();
        if (!row) return;
        const dbs = await this.repo.getLocalDbs(row.user_id);
        this.databases = dbs;
        this.activeDbs = dbs;
        await this.warmUpPool();
    }

    async warmUpPool() {
        await Promise.all(this.activeDbs.map(db => pool.setConnection(db.connectionString)));
    }

    /** Add a database to the in-memory list. Does NOT persist. */
    addDb(db: DatabaseCollection): void {
        this.databases.push(db);
    }

    /**
     * Merge a partial patch into an existing database entry in memory.
     * Also re-persists the updated entry to SQLite.
     * Does NOT touch Supabase.
     */
    async updateDb(dbId: string, patch: Partial<DatabaseCollection>): Promise<void> {
        const row = this.sessionRepo.getUserSession();
        const updatedList = await Promise.all(
            this.databases.map(async (db) => {
                if (db.id !== dbId) return db;
                const updated = { ...db, ...patch };
                if (row) {
                    await this.repo.setLocalDb(updated, row.user_id);
                }
                return updated;
            })
        );
        this.databases = updatedList;
    }

    /**
     * Persist a database entry to SQLite + keychain.
     * Called by DatabaseRegistryService after registerConnection.
     */
    async persistDb(db: DatabaseCollection): Promise<void> {
        const row = this.sessionRepo.getUserSession();
        if (!row) return;
        await this.repo.setLocalDb(db, row.user_id);
    }

    /** Remove a database from memory and delete from SQLite. */
    removeDb(dbId: string): void {
        this.databases = this.databases.filter((db) => db.id !== dbId);
        this.repo.deleteLocalWorkspaceDb(dbId);
    }

    getDb(dbId: string): DatabaseCollection | undefined {
        return this.databases.find((db) => db.id === dbId);
    }

    dbExists(dbUrl: string): boolean {
        return this.databases.some((db) => db.connectionString === dbUrl);
    }
}

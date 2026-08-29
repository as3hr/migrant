import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { appContext } from "../../../domain/index.ts";

export class PoolConnector {
    pools: Record<string, Pool> = {};

    async setConnection(dbUrl: string): Promise<string | null> {
        const dbId = await appContext.services.databaseRegistryService.registerConnection(dbUrl);
        if (!dbId) return null;
        this.pools[dbId] = new Pool({ connectionString: dbUrl });
        return dbId;
    }

    getPool(dbId: string) {
        return this.pools[dbId];
    }

    close(dbId: string) {
        const pool = this.pools[dbId];
        if (!pool) return;
        pool.end();
        delete this.pools[dbId];
        appContext.workspace.removeDb(dbId);
    }

    async query<T extends QueryResultRow = QueryResultRow>(
        dbId: string,
        query: string,
        params?: unknown[]
    ): Promise<QueryResult<T>> {
        if (!this.pools[dbId]) {
            const db = appContext.workspace.getDb(dbId);
            if (db?.connectionString) {
                this.pools[dbId] = new Pool({ connectionString: db.connectionString });
            } else {
                throw new Error(`Database ${dbId} is not connected.`);
            }
        }

        const pool = this.pools[dbId];
        return pool.query<T>(query, params);
    }        
}

export const pool = new PoolConnector();

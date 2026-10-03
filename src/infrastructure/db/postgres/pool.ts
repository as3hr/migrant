import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { appContext } from "../../../domain/index.ts";
import { isLocalConnection } from "../../../utils/index.ts";

export class PoolConnector {
    pools: Record<string, Pool> = {};

    async setConnection(dbUrl: string): Promise<string | null> {
        const dbId = await appContext.services.databaseConnectionService.registerConnection(dbUrl);
        if (!dbId) return null;

        this.pools[dbId] = this.createPool(dbUrl);
        return dbId;
    }

    getPool(dbId: string) {
        return this.pools[dbId];
    }

    async close(dbId: string) {
        const pool = this.pools[dbId];
        if (!pool) return;
        await pool.end();
        delete this.pools[dbId];
        appContext.workspace.removeDbFromWorkspace(dbId);
    }

    async query<T extends QueryResultRow = QueryResultRow>(
        dbId: string,
        query: string,
        params?: unknown[]
    ): Promise<QueryResult<T>> {
        try {
            if (!this.pools[dbId]) {
                const db = appContext.workspace.getDb(dbId);
                if (db?.connectionString) {
                    this.pools[dbId] = this.createPool(db.connectionString);
                } else {
                    throw new Error(`Database ${dbId} is not connected.`);
                }
            }
            const pool = this.pools[dbId];
            return pool.query<T>(query, params);
        } catch (err) {
            throw err;
        }
    }        

    private createPool(connectionString: string): Pool {
        const isLocal = isLocalConnection(connectionString);
        return new Pool({
            connectionString,
            ssl: isLocal ? false : { rejectUnauthorized: false },
            connectionTimeoutMillis: isLocal ? 3000 : 10000,
        });
    }
}

export const pool = new PoolConnector();

import { appContext } from "@src/exports.ts";
import { Pool, type QueryResult, type QueryResultRow } from "pg";

export class PoolConnector { 
    pool: Pool | null = null;
    dbUrl: string | null = null;
    dbId: string | null = null;

    async connect(dbUrl: string) {
        if (this.pool) {
            this.close();
        }
        this.dbUrl = dbUrl;
        this.pool = new Pool({ connectionString: dbUrl });
        const dbId = await appContext.services.registryService.registerConnection(dbUrl);
        if (dbId) {
            this.dbId = dbId;
        }
    }

    close() {
        if (!this.pool) return;
        this.pool.end();
        if (this.dbId) {
            appContext.workspace.removeDb(this.dbId);
        }
        this.pool = null;
        this.dbId = null;
        this.dbUrl = null;
    }

    async query<T extends QueryResultRow = QueryResultRow>(
        query: string, params?: unknown[]
    ): Promise<QueryResult<T>> {
        if (!this.pool) {
            throw new Error("Database is not connected");
        }
        return this.pool.query<T>(query, params);
    }
}

export const pool = new PoolConnector();
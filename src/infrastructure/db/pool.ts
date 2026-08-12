import { appContext } from "@src/exports.ts";
import { Pool, type QueryResult, type QueryResultRow } from "pg";

class PoolConnector { 
    pool: Pool | null = null;
    dbUrl: string | null = null;
    dbId: string | null = null;

    async connect(dbUrl: string) {
        if(this.pool) {
            return this.pool;
        }
        this.dbUrl = dbUrl;
        this.setDbId();
        this.pool = new Pool({ connectionString: dbUrl });
        await appContext.services.databaseService.createDatabaseEntry();
    }

    close() {
        if(!this.pool) {
            return;
        }
        this.pool.end();
        this.pool = null;
        this.dbId = null;
        this.dbUrl = null;
    }

    async query(query: string, params?: any[]): Promise<QueryResult<QueryResultRow>> {
        if(!this.pool) {
            throw new Error("Database is not connected");
        }
        try {
            const result = await this.pool.query<QueryResult>(query, params);
            return result;
        } catch(error) {
            throw new Error(`Failed to query database: ${error}`);
        }
    }

    setDbId() {
        if (!this.dbUrl) return;
        const url = new URL(this.dbUrl);
        const dbId = url.pathname.slice(1);
        this.dbId = dbId;
    }
}

export const pool = new PoolConnector();
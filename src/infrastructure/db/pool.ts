import { appContext } from "@src/exports.ts";
import { Pool, type QueryResult, type QueryResultRow } from "pg";

export class PoolConnector { 
    pool: Pool | null = null;
    dbUrl: string | null = null;
    dbId: string | null = null;

    async connect(dbUrl: string) {
        if(this.pool) {
            this.close();
        }
        this.dbUrl = dbUrl;
        this.pool = new Pool({ connectionString: dbUrl });
        await this.addDbToContext();
    }

    close() {
        if(!this.pool) {
            return;
        }
        this.pool.end();
        appContext.workspace.removeDbFromWorkSpace(this.dbId!);
        this.pool = null;
        this.dbId = null;
        this.dbUrl = null;
    }

    async addDbToContext() {
        if (this.dbUrl) {
            const dbId = await appContext.services.databaseService.createDatabaseEntry();
            if (dbId) {
                this.dbId = dbId;
                appContext.workspace.addDbToWorkspace(this.dbUrl, this.dbId);
                appContext.workspace.setActiveDbId(this.dbId);
            }
        }
    }

    async query<T extends QueryResultRow = QueryResultRow>(
        query: string, params?: unknown[]
    ): Promise<QueryResult<T>> {
        if(!this.pool) {
            throw new Error("Database is not connected");
        }
        const result = await this.pool.query<T>(query, params);
        return result;
    }
}

export const pool = new PoolConnector();
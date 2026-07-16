import { Pool, type QueryResultRow } from "pg";

class PoolConnector { 
    pool: Pool | null = null;
    
    connect(dbUrl: string) {
        if(this.pool) {
            return this.pool;
        }
        this.pool = new Pool({ connectionString: dbUrl });
        console.log('Database connected successfully!');
    }

    close() {
        if(!this.pool) {
            return;
        }
        this.pool.end();
        this.pool = null;
    }

    async query(query: string, params?: any[]): Promise<QueryResultRow> {
        if(!this.pool) {
            throw new Error("Database is not connected");
        }
        try {
            const result = await this.pool.query<QueryResultRow>(query, params);
            return result;
        } catch(error) {
            throw new Error("Failed to query database");
        }
    }
}

export default PoolConnector;
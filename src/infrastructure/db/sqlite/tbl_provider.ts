import type { ProviderId } from "../../index.ts";
import { sqlClient } from "./sqlite.client.ts";

export interface IProvider {
    id: ProviderId;
    user_id: string;
    api_key_env: string;
}

class TblProvider {
    private insertProviderStmt: any;
    private selectProviderStmt: any;
    private deleteProviderStmt: any;

    initializeTblProvider() {
        sqlClient.run(`
          CREATE TABLE IF NOT EXISTS providers (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            api_key_env TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        this.insertProviderStmt = sqlClient.prepare(
            'INSERT OR REPLACE INTO providers (id, user_id, api_key_env) VALUES (?, ?, ?)'
        );
        this.selectProviderStmt = sqlClient.prepare(
            'SELECT * FROM providers WHERE id = ?'
        );
        this.deleteProviderStmt = sqlClient.prepare(
            'DELETE FROM providers WHERE id = ?'
        );
    }

    setProvider(provider: IProvider): void { 
        this.insertProviderStmt.run(provider.id, provider.user_id, provider.api_key_env); 
    }
    
    getProvider(providerId: ProviderId) { 
        return this.selectProviderStmt.get(providerId) as IProvider | undefined;
    }

    getActiveProvider(): IProvider | undefined {
        const row = sqlClient.prepare('SELECT * FROM providers LIMIT 1').get();
        return row as IProvider | undefined;
    }

    deleteProvider(providerId: ProviderId): boolean {
        const info = this.deleteProviderStmt.run(providerId);
        return info.changes > 0;
    }
}


export const tblProvider = new TblProvider();
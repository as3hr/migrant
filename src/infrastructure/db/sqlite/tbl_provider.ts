import type { ProviderId } from "../../index.ts";
import { sqlClient } from "./sqlite.client.ts";

export interface IProvider {
    id: ProviderId;
    user_id: string;
    api_key_env: string;
    selected_model_id: string;
}

class TblProvider {
    private insertProviderStmt: any;
    private selectProviderStmt: any;
    private deleteProviderStmt: any;

    initializeTblProvider() {
        sqlClient.run(`
          CREATE TABLE IF NOT EXISTS tbl_provider (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            api_key_env TEXT NOT NULL,
            selected_model_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        this.insertProviderStmt = sqlClient.prepare(
            'INSERT OR REPLACE INTO tbl_provider (id, user_id, api_key_env, selected_model_id) VALUES (?, ?, ?, ?)'
        );
        this.selectProviderStmt = sqlClient.prepare(
            'SELECT id, user_id, api_key_env, selected_model_id FROM tbl_provider LIMIT 1'
        );
        this.deleteProviderStmt = sqlClient.prepare(
            'DELETE FROM tbl_provider'
        );
    }

    setProvider(provider: IProvider): void { 
        this.deleteProvider();
        this.insertProviderStmt.run(provider.id, provider.user_id, provider.api_key_env, provider.selected_model_id); 
    }

    getActiveProvider(): IProvider | undefined {
        return this.selectProviderStmt.get() as IProvider | undefined;
    }

    deleteProvider() {
        this.deleteProviderStmt.run();
    }
}


export const tblProvider = new TblProvider();
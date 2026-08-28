import { sqlLite } from "../../infrastructure/clients/sqllite.client.ts";
import type { ProviderId } from "../../infrastructure/provider/providers.ts";

interface ProviderRow {
    id: ProviderId;
    user_id: string;
    api_key_env: string;
}

export class LocalProviderRepository {
    private insertProviderStmt;
    private selectProviderStmt;
    private deleteProviderStmt;

    constructor() {
        this.insertProviderStmt = sqlLite.prepare(
            'INSERT OR REPLACE INTO providers (id, user_id, api_key_env) VALUES (?, ?, ?)'
        );
        this.selectProviderStmt = sqlLite.prepare(
            'SELECT * FROM providers WHERE id = ?'
        );
        this.deleteProviderStmt = sqlLite.prepare(
            'DELETE FROM providers WHERE id = ?'
        );
    }

    setProvider(provider: ProviderRow): void { 
        this.insertProviderStmt.run(provider.id, provider.user_id, provider.api_key_env); 
    }

    getProvider(providerId: ProviderId) { 
        return this.selectProviderStmt.get(providerId) as ProviderRow | undefined;
    }

    deleteProvider(providerId: ProviderId): boolean {
        const info = this.deleteProviderStmt.run(providerId);
        return info.changes > 0;
    }
}
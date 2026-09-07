import { createHash } from "node:crypto";
import { appContext, type DatabaseCollection } from "../../domain/index.ts";
import { getDbName } from "../../utils/index.ts";

export class DatabaseConnectionService {
    async registerConnection(dbUrl: string): Promise<string | null> {
        const user = await appContext.services.authService.getCurrentUser();
        if (!user?.id) return null;

        const url = new URL(dbUrl);
        const identity = `${url.hostname}:${url.port || "5432"}${url.pathname}`;
        const dbId = createHash("sha256").update(identity).digest("hex").slice(0, 32);

        const connectionStringKey = `database-${dbId}`;
        const existingDb = appContext.workspace.databases.find((db) => db.id === dbId);
        let payLoad: DatabaseCollection = {
            id: dbId,
            name: getDbName(dbUrl),
            type: "postgres",
            connectionString: dbUrl,
            connectionStringKey: connectionStringKey,
            schemaFingerprint: null,
            lastScannedAt: undefined,
            indexStatus: "none",
            userId: user.id,
        };
        if (existingDb) {
            payLoad.lastScannedAt = existingDb.lastScannedAt;
            payLoad.schemaFingerprint = existingDb.schemaFingerprint;
            payLoad.indexStatus = existingDb.indexStatus;
        }

        appContext.workspace.removeDb(dbId);
        appContext.workspace.addDb(payLoad);
        await appContext.workspace.persistDb(payLoad);

        return dbId;
    }

    async updateDatabase(
        dbId: string,
        patch: Partial<DatabaseCollection>
    ): Promise<void> {
        await appContext.workspace.updateDb(dbId, patch);
    }
}

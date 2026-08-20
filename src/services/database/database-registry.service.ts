import {
    appContext,
    getDbName,
    pool,
    supabase,
    type DatabaseCollection,
    type UpdateDatabaseType,
} from "@src/exports.ts";
import { createHash } from "crypto";

/**
 * DatabaseRegistryService — the single source of truth for all database state.
 *
 * Every mutation to a connected database's metadata must go through here.
 * It keeps all three stores in sync atomically:
 *   1. Supabase  — remote "Database" table (dbId, schema_fingerprint, etc.)
 *   2. SQLite    — local workspace persistence (via LocalWorkspaceRepository)
 *   3. WorkSpace — in-memory runtime state
 *
 * Nobody else should call workspace.updateDb(), localRepo.setWorkspaceDb(),
 * or supabase.from("Database").update() directly.
 */
export class DatabaseRegistryService {
    /**
     * Called when a PostgreSQL connection is established.
     * - Gets or creates the Supabase database record.
     * - Adds the database to the in-memory workspace.
     * - Persists it to SQLite + keychain.
     *
     * Returns the Supabase database id (uuid), or null on failure.
     */
    async registerConnection(dbUrl: string): Promise<string | null> {
        const user = await appContext.services.authService.getCurrentUser();
        if (!user?.id) return null;

        const dbId = await this._getOrCreateSupabaseEntry(dbUrl, user.id);
        if (!dbId) return null;

        const newDb: DatabaseCollection = {
            id: dbId,
            name: getDbName(dbUrl),
            connectionString: dbUrl,
            type: "postgres",
            schemaFingerprint: null,   // set after first successful scan
            indexStatus: "none",
            indexVersion: 0,
        };

        // Remove the old entry first (handles reconnect to same DB)
        appContext.workspace.removeDb(dbId);

        appContext.workspace.addDb(newDb);
        await appContext.workspace.persistDb(newDb);

        return dbId;
    }

    /**
     * Updates a database's metadata across all three stores simultaneously.
     *
     * Only the fields you pass in `patch` are updated — everything else is
     * preserved via a merge in WorkSpace.
     *
     * Pass `supabaseFields` for any fields that also live in the remote
     * Supabase "Database" table (e.g. schema_fingerprint).
     */
    async updateDatabase(
        dbId: string,
        patch: Partial<DatabaseCollection>,
        supabaseFields?: Partial<UpdateDatabaseType>
    ): Promise<void> {
        // 1. Update in-memory workspace (also re-persists to SQLite)
        await appContext.workspace.updateDb(dbId, patch);

        // 2. If there are Supabase fields to sync, update the remote record
        if (supabaseFields && Object.keys(supabaseFields).length > 0) {
            const { error } = await supabase
                .from("Database")
                .update(supabaseFields)
                .eq("id", dbId);

            if (error) {
                console.error(
                    `[DatabaseRegistryService] Failed to sync to Supabase for db ${dbId}: ${error.message}`
                );
            }
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private async _getOrCreateSupabaseEntry(
        dbUrl: string,
        userId: string
    ): Promise<string | null> {
        const url = new URL(dbUrl);
        const identity = `${url.hostname}:${url.port || "5432"}${url.pathname}`;
        const dbIdentifier = createHash("sha256").update(identity).digest("hex");

        const { data, error } = await supabase
            .from("Database")
            .select("id")
            .eq("database_identifier", dbIdentifier)
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error(`[DatabaseRegistryService] Supabase lookup failed: ${error.message}`);
            return null;
        }

        if (data) return data.id;

        const { data: inserted, error: insertError } = await supabase
            .from("Database")
            .insert({ database_identifier: dbIdentifier, user_id: userId })
            .select("id")
            .single();

        if (insertError) {
            console.error(`[DatabaseRegistryService] Supabase insert failed: ${insertError.message}`);
            return null;
        }

        return inserted.id;
    }
}

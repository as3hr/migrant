import { appContext, type CommandContext, type DatabaseCollection } from "../../../domain/index.ts";
import { startScan } from "../../../services/index.ts";
import { appMemo } from "../../../utils/index.ts";
import { getSchemaFingerprint } from "../../db/index.ts";

export async function ensureIndexFresh(
    database: DatabaseCollection,
    ctx: CommandContext
): Promise<boolean> {
    try {
        const liveFingerprint = await appMemo.getOrFetch(database.id, () =>
            getSchemaFingerprint(database.id)
        );

        const isStale =
            database.indexStatus !== "ready" ||
            database.schemaFingerprint !== liveFingerprint;

        if (!isStale) return false;

        appMemo.invalidate(database.id);
        if (ctx.appendToolCall) {
            ctx.appendToolCall(`Updating knowledge for ${database.name}...`);
        } else {
            ctx.log(`Updating knowledge for ${database.name}...`);
        }
        await appContext.services.databaseConnectionService.updateDatabase(database.id, {
            indexStatus: "indexing",
        });
        if (ctx.appendToolCall) {
            ctx.appendToolCall(`Starting scan for ${database.name}...`);
        } else {
            ctx.log(`Starting scan for ${database.name}...`);
        }
        await startScan(database.id);
        return true;
    } catch (err) {
        throw err;
    }
}
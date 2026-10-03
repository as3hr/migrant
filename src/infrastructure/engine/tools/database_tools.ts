import { tool } from "ai";
import z from "zod";
import { appContext } from "../../../domain/app_context.ts";
import { startScan } from "../../../services/index.ts";
import { appMemo } from "../../../utils/cache.ts";
import { getSchemaFingerprint } from "../../db/index.ts";
import { getDatabaseContextForUserQuery } from "../core/db_overview.ts";

export const isStaleTool = tool({
    description: `Check if the database is stale, 
    the database schema or index status has changed since the last time it was indexed`,
    inputSchema: z.object({
        dbId: z.string(),
    }),
    execute: async ({ dbId }) => {
        const database = appContext.workspace.databases.find((db) => db.id === dbId);
        
        if (!database) {
            throw new Error(`Database with id ${dbId} not found.`);
        }

        const liveFingerprint = await appMemo.getOrFetch(dbId, () =>
            getSchemaFingerprint(dbId)
        );

        const isStale =
            database.indexStatus !== "ready" ||
            database.schemaFingerprint !== liveFingerprint;
    
        return { isStale, liveFingerprint }   
    }
});

export const dbOverviewTool = tool({
    description: `Get high level overview of the connected database. Use this when the user asks about:
    - Overall database structure or summary
    - List of all tables
    - Database sizes or statistics
    - Cross-table analysis
    - Unused or duplicate indexes across all tables
    - Orphan tables or unlinked relationships
    - Any question about the whole database without mentioning a specific table name`,
    inputSchema: z.object({
        question: z.string().describe("The user's original question about the database"),
        dbId: z.string().optional().describe("Specific database ID to query. If not provided, queries all connected databases"),
    }),
    execute: async ({ question, dbId }) => {
        const databases = dbId
            ? appContext.workspace.databases.filter(db => db.id === dbId)
            : appContext.workspace.databases;

        if (databases.length === 0) {
            return { error: "No connected databases found. Connect a database using /connect." };
        }

        appContext.commandCtx?.log(
            `Querying ${databases.map(db => db.name).join(", ")}...`
        );

        const results = await Promise.allSettled(
            databases.map(db => getDatabaseContextForUserQuery(question, db))
        );

        const successful = results
            .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getDatabaseContextForUserQuery>>>> => 
                r.status === "fulfilled" && r.value !== null
            )
            .map(r => r.value);

        if (successful.length === 0) {
            return { error: "Could not retrieve database overview. Try rephrasing your question." };
        }

        const response = {
            databases: successful.map(r => ({
                name: r.database.name,
                data: r.finalResponse,
            }))
        };

        return response;
    }
});


export const reIndexCompleteDatabase = tool({
    description: `Re-index the complete database, 
    this will re-index the full database and recreate all the indexes. Use this when you want a fresh image of this database, when database is stale, and you want to update the schema and index status.`,
    inputSchema: z.object({
        dbId: z.string().describe("Specific database ID to scan"),
    }),
    execute: async ({ dbId }) => {
        const database = appContext.workspace.databases.find((db) => db.id === dbId);

        if (!database) {
            throw new Error(`Database with id ${dbId} not found.`);
        }

        const resp = await startScan(dbId);

        return resp ? `Re Indexed ${database.name} Successfully!` : `Failed to re index ${database.name}, there might be some error while indexing`;
    }
})

export const getAvailableDatabaseTool = tool({
    description: "Get list of available databases, you can get database id and name, this will help you to query the database",
    inputSchema: z.object({}),
    execute: () => {
        return appContext.workspace.databases.map(db => ({
            id: db.id,
            name: db.name,
            type: db.type,
            schemaFingerPrint: db.schemaFingerprint,
            indexStatus: db.indexStatus,
        }));
    }
});
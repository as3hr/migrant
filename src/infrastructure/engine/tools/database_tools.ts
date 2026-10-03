import { tool } from "ai";
import z from "zod";
import { appContext } from "../../../domain/app_context.ts";
import {
    getEnums,
    getFunctions,
    getSchemas,
    getSequences,
    getTables,
    getTriggers,
    getViews
} from "../../db/index.ts";
import { getDatabaseContextForUserQuery } from "../core/db_overview.ts";
import { ensureIndexFresh } from "../core/index_scan.ts";

export const dbOverviewTool = tool({
    description: `God Mode metadata analytics tool. Use this ONLY for complex, cross-table analysis, such as:
    - Overall database structure or summary across all schemas
    - Database sizes, statistics, or metrics
    - Cross-table analysis (e.g. finding tables without primary keys, or finding unused indexes)
    - Orphan tables or unlinked relationships
    DO NOT use this tool for simple lookups (like getting columns of a specific table, or listing tables in a specific schema) — use the specific tools (getTablesTool, getColumnsTool) for those instead.`,
    inputSchema: z.object({
        question: z.string().describe("The user's original question about the database"),
        dbId: z.string().optional().describe("Specific database ID to query. If not provided, queries all connected databases"),
    }),
    execute: async ({ question, dbId }) => {
        const databases = dbId
            ? appContext.workspace.databases.filter(db => db.id === dbId)
            : appContext.workspace.databases;

        if (databases.length === 0) return { error: "No connected databases found. Connect a database using /connect." };
        appContext.commandCtx?.log(`Querying ${databases.map(db => db.name).join(", ")}...`);

        const results = await Promise.allSettled(databases.map(db => getDatabaseContextForUserQuery(question, db)));
        const successful = results
            .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getDatabaseContextForUserQuery>>>> => r.status === "fulfilled" && r.value !== null)
            .map(r => r.value);

        if (successful.length === 0) return { error: "Could not retrieve database overview. Try rephrasing your question." };

        return {
            databases: successful.map(r => ({ name: r.database.name, data: r.finalResponse }))
        };
    }
});

export const reIndexCompleteDatabase = tool({
    description: `Re-index the complete database. 
    Use this ONLY when the user explicitly asks to refresh, rescan, or update the database index. Never call this autonomously.`,
    inputSchema: z.object({
        dbId: z.string().describe("Specific database ID to scan"),
    }),
    execute: async ({ dbId }) => {
        const database = appContext.workspace.databases.find((db) => db.id === dbId);
        if (!database) throw new Error(`Database with id ${dbId} not found.`);

        const response = await ensureIndexFresh(database, appContext.commandCtx!);

        return response ? `Re Indexed ${database.name} Successfully!` : `Database index for ${database.name} is already up to date. No re-scan needed.`;
    }
});

export const getAvailableDatabaseTool = tool({
    description: "Get list of connected databases. Use this first to get the database IDs (dbId) required by other tools.",
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

export const getSchemasTool = tool({
    description: "Get a list of all non-system schemas in the database. Fast and precise.",
    inputSchema: z.object({ dbId: z.string() }),
    execute: async ({ dbId }) => ({ schemas: await getSchemas(dbId) })
});

export const getTablesTool = tool({
    description: "Get a list of all tables (and their columns, foreign keys, indexes, constraints) for a specific schema. Use this when the user asks about the structure of a table or all tables in a schema.",
    inputSchema: z.object({
        schema: z.string().describe("The schema name (e.g. 'public', 'core')"),
        dbId: z.string(),
    }),
    execute: async ({ schema, dbId }) => {
        try { return { tables: await getTables(schema, dbId) }; }
        catch (e) { return { error: (e as Error).message }; }
    }
});

export const getViewsTool = tool({
    description: "Get a list of all views and their definitions for a specific schema.",
    inputSchema: z.object({ schema: z.string(), dbId: z.string() }),
    execute: async ({ schema, dbId }) => ({ views: await getViews(schema, dbId) })
});

export const getTriggersTool = tool({
    description: "Get a list of all triggers and their definitions for a specific schema.",
    inputSchema: z.object({ schema: z.string(), dbId: z.string() }),
    execute: async ({ schema, dbId }) => ({ triggers: await getTriggers(schema, dbId) })
});

export const getFunctionsTool = tool({
    description: "Get a list of all functions/stored procedures and their definitions for a specific schema.",
    inputSchema: z.object({ schema: z.string(), dbId: z.string() }),
    execute: async ({ schema, dbId }) => ({ functions: await getFunctions(schema, dbId) })
});

export const getEnumsTool = tool({
    description: "Get a list of all custom ENUM types and their values for a specific schema.",
    inputSchema: z.object({ schema: z.string(), dbId: z.string() }),
    execute: async ({ schema, dbId }) => ({ enums: await getEnums(schema, dbId) })
});

export const getSequencesTool = tool({
    description: "Get a list of all sequences for a specific schema.",
    inputSchema: z.object({ schema: z.string(), dbId: z.string() }),
    execute: async ({ schema, dbId }) => ({ sequences: await getSequences(schema, dbId) })
});
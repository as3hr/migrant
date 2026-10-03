import { tool } from "ai";
import z from "zod";
import { appContext } from "../../../domain/app_context.ts";
import { ensureIndexFresh } from "../core/index_scan.ts";

export const semanticSearchTool = tool({
    description: "Semantic search for database schema and table definitions. Returns context for fuzzy or specific questions about the database.",
    inputSchema: z.object({
        query: z.string().describe("The user's question about the database"),
        dbId: z.string().optional().describe("Specific database ID to query. If not provided, queries all connected databases"),
    }),
    execute: async ({ query, dbId }) => {
        const databases = dbId
            ? appContext.workspace.databases.filter(db => db.id === dbId)
            : appContext.workspace.databases;

        if (!databases || databases.length === 0) {
            appContext.commandCtx?.error("No connected databases found. Connect a database using /connect.");
            return null;
        }

        for (const db of databases) {
            try {
                await ensureIndexFresh(db, appContext.commandCtx!);
            } catch (e) {
                console.error(`Failed to check stale status or scan database ${db.id}:`, e);
            }
        }

        const semanticResult = await Promise.all(
            databases.map(async db => {
                return await appContext.services.docIndex.performSemanticSearch(query, db);
            })
        );
        
        const validResults = semanticResult.filter((r): r is NonNullable<typeof r> => Boolean(r?.context));
        if (validResults.length === 0) {
            return null;
        }

        return validResults.map(r => `### Database: ${r.database.name}\n${r.context}`).join("\n\n");
    }
});
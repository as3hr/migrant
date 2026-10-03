import { tool } from "ai";
import z from "zod";
import { appContext } from "../../../domain/app_context.ts";

export const semanticSearchTool = tool({
    description: "Semantic search for database schema and table definitions, in return you can get a string with the context, make sure to ",
    inputSchema: z.object({
        query: z.string().describe("The user's question about the database"),
        dbId: z.string().optional().describe("Specific database ID to query. If not provided, queries all connected databases"),
    }),
    execute: async ({ query, dbId }) => {
        
        const databases = dbId
            ? appContext.workspace.databases.filter(db => db.id === dbId)
            : appContext.workspace.databases;
        if (!databases) {
            appContext.commandCtx?.error("No connected databases found. Connect a database using /connect.");
            return null;
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

        const context = validResults.map(r => `### Database: ${r.database.name}\n${r.context}`).join("\n\n");

        return context;
    }
});
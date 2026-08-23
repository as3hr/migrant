import { appContext, getDatabaseContextForUserQuery, getSchemaFingerprint, startScan, type CommandContext, type DatabaseCollection } from "@src/exports.ts";
import {
    buildConversationalPrompt,
    buildDbOverviewPrompt,
    buildGeneralDbPrompt,
    buildSchemaRagPrompt,
    CONVERSATIONAL_SYSTEM_PROMPT,
    DB_OVERVIEW_PROMPT,
    GENERAL_DB_SYSTEM_PROMPT,
    SCHEMA_RAG_SYSTEM_PROMPT,
    type RouterIntent
} from "./prompts/index.ts";

interface AgentPayload {
    systemPrompt: string;
    userPrompt: string;
}

export async function resolveAgentPayload(
    targetAgent: RouterIntent,
    query: string,
    ctx: CommandContext
): Promise<AgentPayload | null> {
    ctx.log(`Routing to target agent: ${targetAgent}`);
    switch (targetAgent) {
        case "schema-rag": {
            const ragContext = await buildRagContext(query, ctx);
            if (!ragContext) return null;
            return {
                systemPrompt: SCHEMA_RAG_SYSTEM_PROMPT,
                userPrompt: buildSchemaRagPrompt(query, ragContext),
            };
        }

        case "db-overview": {
            const dbOverviewContext = await buildDbOverviewContext(query, ctx);
            if (!dbOverviewContext) return null;
            return {
                systemPrompt: DB_OVERVIEW_PROMPT,
                userPrompt: buildDbOverviewPrompt(query, dbOverviewContext),
            };
        }

        case "general-db": {
            return {
                systemPrompt: GENERAL_DB_SYSTEM_PROMPT,
                userPrompt: buildGeneralDbPrompt(query),
            };
        }

        case "conversational": {
            return {
                systemPrompt: CONVERSATIONAL_SYSTEM_PROMPT,
                userPrompt: buildConversationalPrompt(query),
            };
        }

        default: {
            ctx.error("Unknown query route encountered.");
            return null;
        }
    }
}

async function buildRagContext(query: string, ctx: CommandContext) {
    const databases = appContext.workspace.getActiveDbs();
    if (!databases) {
        ctx.error("No connected databases found. Connect a database using /connect.");
        return null;
    }
    const semanticResult = await Promise.all(
        databases.map(async db => {
            await ensureIndexFresh(db, ctx);
            return await appContext.services.ragService.performSemanticSearch(query, db);
        })
    );
    const validResults = semanticResult.filter((r): r is NonNullable<typeof r> => Boolean(r?.context));
    if (validResults.length === 0) {
        ctx.log("Could not find relevant schema context for this query.");
        return null;
    }
    const context = validResults.map(r => `### Database: ${r.database.name}\n${r.context}`).join("\n\n");
    return context;
}

async function buildDbOverviewContext(query: string, ctx: CommandContext) {
    const databases = appContext.workspace.getActiveDbs();
    if (!databases) {
        ctx.error("No connected databases found. Connect a database using /connect.");
        return null;
    }
    const dbOverviewData = await Promise.all(
        databases.map(async db => {
            await ensureIndexFresh(db, ctx);
            return await getDatabaseContextForUserQuery(query, db);
        })
    );
    const validOverviews = dbOverviewData.filter((r): r is NonNullable<typeof r> => Boolean(r?.finalResponse));
    if (validOverviews.length === 0) {
        ctx.log("Could not retrieve system metadata for database overview.");
        return null;
    }
    const formattedData = validOverviews.map(r => `### Database: ${r.database.name}\n${r.finalResponse}`).join("\n\n");
    return formattedData;
}

async function ensureIndexFresh(
  database: DatabaseCollection,
  ctx: CommandContext
): Promise<void> {
  const liveFingerprint = await getSchemaFingerprint(database.id);
  
  const isStale =
    database.indexStatus !== "ready" ||
    database.schemaFingerprint !== liveFingerprint;

  if (!isStale) return;

  ctx.log(`Updating knowledge for ${database.name}...`);
  await appContext.services.databaseRegistryService.updateDatabase(database.id, {
    indexStatus: "indexing",
  });

  try {
    await startScan(ctx, database.id);
  } catch (err) {
    throw err;
  }
}

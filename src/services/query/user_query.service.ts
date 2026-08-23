import { appContext, getDatabaseContextForUserQuery, openRouter, type CommandContext } from "@src/exports.ts";
import { generateText, Output } from "ai";
import {
    buildConversationalPrompt,
    buildDbOverviewPrompt,
    buildGeneralDbPrompt,
    buildSchemaRagPrompt,
    CONVERSATIONAL_SYSTEM_PROMPT,
    DB_OVERVIEW_PROMPT,
    GENERAL_DB_SYSTEM_PROMPT,
    ROUTER_SYSTEM_PROMPT,
    routerOutputSchema,
    SCHEMA_RAG_SYSTEM_PROMPT,
    type RouterIntent,
} from "./prompts/index.ts";

interface AgentPayload {
    systemPrompt: string;
    userPrompt: string;
}

export async function userQuery(query: string, databaseId: string, ctx: CommandContext) {
    try {
        const { output } = await generateText({
            model: openRouter("deepseek/deepseek-chat"),
            output: Output.object({
                schema: routerOutputSchema,
            }),
            instructions: [
                {
                    role: "system",
                    content: ROUTER_SYSTEM_PROMPT,
                },
            ],
            prompt: query,
        });

        const payload = await resolveAgentPayload(output.targetAgent, query, databaseId, ctx);
        if (!payload) return;

        let response = "";
        const stream = appContext.services.llmService.streamLlm(
            payload.systemPrompt,
            payload.userPrompt,
            "deepseek/deepseek-chat"
        );

        let firstChunk = true;
        for await (const chunk of stream) {
            response += chunk;
            if (firstChunk) {
                ctx.log(response);
                firstChunk = false;
            } else {
                ctx.replaceLast(response);
            }
        }
    } catch (error) {
        console.error("Error in userQuery service:", error);
        ctx.error("Failed to process your query. Please try again.");
    }
}

async function resolveAgentPayload(
    targetAgent: RouterIntent,
    query: string,
    databaseId: string,
    ctx: CommandContext
): Promise<AgentPayload | null> {
    ctx.log(`Routing to target agent: ${targetAgent}`);
    switch (targetAgent) {
        case "schema-rag": {
            const semanticResult = await appContext.services.ragService.performSemanticSearch(query, databaseId);
            if (!semanticResult?.context) {
                ctx.log("Could not find relevant schema context for this query.");
                return null;
            }
            return {
                systemPrompt: SCHEMA_RAG_SYSTEM_PROMPT,
                userPrompt: buildSchemaRagPrompt(query, semanticResult.context),
            };
        }

        case "db-overview": {
            const dbOverviewData = await getDatabaseContextForUserQuery(query, databaseId);
            if (!dbOverviewData) {
                ctx.log("Could not retrieve system metadata for database overview.");
                return null;
            }
            return {
                systemPrompt: DB_OVERVIEW_PROMPT,
                userPrompt: buildDbOverviewPrompt(query, dbOverviewData),
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
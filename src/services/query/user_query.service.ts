import { appContext, openRouter, type CommandContext } from "@src/exports.ts";
import { generateText, Output } from "ai";
import {
    buildConversationalPrompt,
    buildGeneralDbPrompt,
    buildSchemaRagPrompt,
    buildSqlGenerationPrompt,
    CONVERSATIONAL_SYSTEM_PROMPT,
    GENERAL_DB_SYSTEM_PROMPT,
    ROUTER_SYSTEM_PROMPT,
    routerOutputSchema,
    SCHEMA_RAG_SYSTEM_PROMPT,
    SQL_GENERATION_SYSTEM_PROMPT,
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
    switch (targetAgent) {
        case "schema-rag": {
            const semanticResult = await appContext.services.ragService.performSemanticSearch(query, databaseId);
            if (!semanticResult?.context) {
                ctx.log("Could not find relevant schema context for this query. Responding using general knowledge.");
                return {
                    systemPrompt: GENERAL_DB_SYSTEM_PROMPT,
                    userPrompt: buildGeneralDbPrompt(query),
                };
            }
            return {
                systemPrompt: SCHEMA_RAG_SYSTEM_PROMPT,
                userPrompt: buildSchemaRagPrompt(query, semanticResult.context),
            };
        }

        case "sql-generation": {
            const semanticResult = await appContext.services.ragService.performSemanticSearch(query, databaseId);
            const schemaContext = semanticResult?.context ?? "No specific schema index available.";
            return {
                systemPrompt: SQL_GENERATION_SYSTEM_PROMPT,
                userPrompt: buildSqlGenerationPrompt(query, schemaContext),
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
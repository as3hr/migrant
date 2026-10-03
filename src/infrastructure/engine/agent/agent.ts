import type { User } from "@supabase/supabase-js";
import { generateText, type GenerateTextEndEvent, type ToolSet } from "ai";
import type { Context } from "node:vm";
import type { CommandContext } from "../../../domain/index.ts";
import { appContext } from "../../../domain/index.ts";
import { AGENT_SYSTEM_PROMPT } from "../prompts/agent_prompt.ts";
import { tools } from "../tools/tools.ts";

const MAX_STEPS = 10;

export async function runAgent(query: string, ctx: CommandContext): Promise<void> {
    const user = await appContext.services.authService.getCurrentUser();
    const databases = appContext.workspace.databases.map(db => db.name);

    const systemPrompt = buildSystemPromptWithContext(AGENT_SYSTEM_PROMPT, user, databases);

    const userMessage = await appContext.services.memoryService.ensureActiveSession(query);
    if (userMessage && ctx.output) {
        ctx.output({ type: "user", content: userMessage });
    }

    const messages = await appContext.services.contextManager.getContext(query);
    const startTime = Date.now();
    let thoughtTimeStr = "";
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let malformedAttempts = 0;
    const MAX_MALFORMED = 3;
    let finalResponse = <GenerateTextEndEvent<NoInfer<ToolSet>, NoInfer<Context>>>{};

    for (let step = 0; step < MAX_STEPS; step++) {
        const { text, toolCalls, responseMessages, usage } = await generateText({
            model: appContext.providerSdk(appContext.selectedModel.modelId),
            system: systemPrompt,
            messages,
            tools,
            toolChoice: "auto",
            maxOutputTokens: 4000,
            onEnd(result) {
                finalResponse = result;
            }
        });

        totalInputTokens += usage?.inputTokens ?? 0;
        totalOutputTokens += usage?.outputTokens ?? 0;

        if (toolCalls && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
                ctx.log(getToolLabel(toolCall.toolName));
            }
            messages.push(...responseMessages);
            continue;
        }

        // Checking for DSML or raw XML tool call leaks
        const leakedToolCall =
            text.match(/<\|.*?\|>[\s\S]*?(?:<\|.*?\|>|$)/g) ||
            text.match(/<tool_call>[\s\S]*?<\/tool_call>/gi) ||
            text.match(/<function_calls>[\s\S]*?<\/function_calls>/gi) ||
            text.match(/<invoke>[\s\S]*?<\/invoke>/gi) ||
            text.match(/```json\s*\{\s*"tool"\s*:/gi);

        if (leakedToolCall) {
            malformedAttempts++;
            if (malformedAttempts >= MAX_MALFORMED) {
                ctx.error("Model is producing malformed responses. Try switching to a different model.");
                return;
            }
            ctx.log("Repairing malformed tool call...");
            messages.push({ role: "assistant", content: text });
            messages.push({ 
                role: "user",
                content: "Your last response contained a malformed tool call. Use only the structured tool calling format, never raw XML or JSON tool calls in your text response."
            });
            continue;
        }

        const thoughtMs = Date.now() - startTime;
        thoughtTimeStr = thoughtMs < 1000 ? `${thoughtMs}ms` : `${(thoughtMs / 1000).toFixed(1)}s`;

        let response = "";
        for (const char of text) {
            response += char;
            ctx.replaceLast(response);
        }

        const assistantMessage = await appContext.services.memoryService.saveTurnToMemory(
            finalResponse,
            totalInputTokens,
            totalOutputTokens,
            "agent",
            thoughtTimeStr,
        );

        if (assistantMessage && ctx.replaceLastWithItem) {
            ctx.replaceLastWithItem({
                type: "assistant",
                content: {
                    ...assistantMessage,
                    thought_time: thoughtTimeStr,
                },
            });
        }

        return;
    }

    ctx.error("Agent reached maximum steps without completing. Try rephrasing your question.");
}

function getToolLabel(toolName: string): string {
    const labels: Record<string, string> = {
        dbOverviewTool: "Analyzing database",
        semanticSearchTool: "Searching schema knowledge",
        getAvailableDatabaseTool: "Checking connected databases",
        isStaleTool: "Checking index freshness",
        reIndexCompleteDatabase: "Re-indexing database",
    };
    return labels[toolName] ?? `Running ${toolName}`;
}

function buildSystemPromptWithContext(
    basePrompt: string,
    user: User | null,
    databases: string[]
): string {
    const userEmail = user?.email || "Not logged in";
    const userName = user?.email ? user.email.split("@")[0] : "Developer";
    const dbList = databases.length > 0 ? databases.join(", ") : "None connected";

    return `${basePrompt.trim()}

### Active Environment Context:
- Talking to User: ${userName} (${userEmail})
- Connected Databases (${databases.length}): ${dbList}`;
}


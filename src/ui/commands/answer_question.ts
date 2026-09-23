import { generateText, Output } from "ai";
import { appContext, type CommandContext } from "../../domain/index.ts";
import { openRouter } from "../../infrastructure/index.ts";
import { resolveAgentPayload, ROUTER_SYSTEM_PROMPT, routerOutputSchema } from "../../services/index.ts";
import { requireAuth } from "./command_helpers.ts";

export async function answerQuestion(
  question: string,
  ctx: CommandContext,
): Promise<void> {
    await requireAuth();
    try {
      const { output } = await generateText({
          model: openRouter("openai/gpt-4o-mini"),
          output: Output.object({
              schema: routerOutputSchema,
          }),
          instructions: [
              {
                  role: "system",
                  content: ROUTER_SYSTEM_PROMPT,
              },
          ],
          temperature: 0,
          maxOutputTokens: 200,
          prompt: question,
      });
        const user = await appContext.services.authService.getCurrentUser();
        const databases = appContext.workspace.activeDbs.map((db) => db.name);  

        const payload = await resolveAgentPayload(output.targetAgent, question, ctx, user, databases);

      if (!payload) return;

      const userMessage = await appContext.services.memoryService.ensureActiveSession(question);
      if (userMessage && ctx.output) {
        ctx.output({ type: "user", content: userMessage });
      }

      const context = await appContext.services.contextManager.getContext(payload.userPrompt);

      const startTime = Date.now();
      let thoughtTimeStr = "";

      let savedAssistantMsg: any = null;
      let response = "";
      const stream = appContext.services.llmService.streamLlm(
          payload.systemPrompt,
          context,
          appContext.selectedModel.modelId,
          async (result) => {
              savedAssistantMsg = await appContext.services.memoryService.saveTurnToMemory(
                  result,
                  output.targetAgent,
                  thoughtTimeStr
              );
          }
      );
        
      let firstChunk = true;
      for await (const chunk of stream) {
          response += chunk;
          if (firstChunk) {
              const thoughtMs = Date.now() - startTime;
              thoughtTimeStr = thoughtMs < 1000 ? `${thoughtMs}ms` : `${(thoughtMs / 1000).toFixed(1)}s`;
              ctx.replaceLast(response);
              firstChunk = false;
          } else {
              ctx.replaceLast(response);
          }
      }

      if (savedAssistantMsg && ctx.replaceLastWithItem) {
          ctx.replaceLastWithItem({
              type: "assistant",
              content: {
                  ...savedAssistantMsg,
                  thought_time: thoughtTimeStr || savedAssistantMsg.thought_time,
              },
          });
      }
    } catch (error: any) {
        ctx.error(`${error}`);
    }
}

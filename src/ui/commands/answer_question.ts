import { appContext, openRouter, resolveAgentPayload, ROUTER_SYSTEM_PROMPT, routerOutputSchema, type CommandContext } from "@src/exports.ts";
import { generateText, Output } from "ai";

export async function answerQuestion(
  question: string,
  ctx: CommandContext,
): Promise<void> {
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
          prompt: question,
      });
      const payload = await resolveAgentPayload(output.targetAgent, question, ctx);
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

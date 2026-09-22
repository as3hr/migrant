import { generateText, Output } from "ai";
import { appContext, type CommandContext } from "../../domain/index.ts";
import { openRouter } from "../../infrastructure/index.ts";
import { fileService, resolveAgentPayload, ROUTER_SYSTEM_PROMPT, routerOutputSchema } from "../../services/index.ts";
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

      const payload = await resolveAgentPayload(output.targetAgent, question, ctx);

      if (!payload) return;

        await appContext.services.memoryService.setUpSession(question);
      const context = await appContext.services.contextManager.getContext(payload.userPrompt);

      let response = "";
      const stream = appContext.services.llmService.streamLlm(
          payload.systemPrompt,
          context,
          appContext.selectedModel.modelId,
          (result) => {
              appContext.services.memoryService.updateMem(result, question);
          }
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
      await fileService.writeDataToFile(response, `./logs/answer.txt`);
    } catch (error: any) {
        ctx.error(`${error}`);
    }
}

import { generateText, Output } from "ai";
import { appContext, type CommandContext } from "../../domain/index.ts";
import { openRouter } from "../../infrastructure/index.ts";
import { fileService, resolveAgentPayload, ROUTER_SYSTEM_PROMPT, routerOutputSchema } from "../../services/index.ts";

export async function answerQuestion(
  question: string,
  ctx: CommandContext,
): Promise<void> {
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
      await appContext.services.memoryService.setQuestionIntoMemory(question);
      const context = await appContext.services.contextManager.getContext(payload.userPrompt);
      ctx.log(`Context: ${JSON.stringify(context, null, 2)}`);

      let response = "";
      const stream = appContext.services.llmService.streamLlm(
          payload.systemPrompt,
          context,
          appContext.selectedModel.modelId,
          (result) => {
              appContext.services.memoryService.setResponseIntoMemory(result);
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

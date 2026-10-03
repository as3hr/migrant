import { type CommandContext } from "../../domain/index.ts";
import { runAgent } from "../engine/agent/agent.ts";
import { requireAuth } from "./command_helpers.ts";

export async function answerQuestion(
  question: string,
  ctx: CommandContext,
): Promise<void> {
    await requireAuth();
    try {
        await runAgent(question, ctx);
    } catch (error: any) {
        ctx.error(`Error in Answer Question:- ${error}`);
    }
}

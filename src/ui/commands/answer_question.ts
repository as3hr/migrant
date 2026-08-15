import { type CommandContext } from "@src/exports.ts";
import { userQuery } from "@src/services/query/user_query_service.ts";

export async function answerQuestion(
  question: string,
  ctx: CommandContext,
): Promise<void> {
  await userQuery(question, ctx);
}
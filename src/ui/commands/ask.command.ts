import type { CommandContext, CommandDefinition } from "@src/exports.ts";
import { userQuery } from "@src/services/query/user_query_service.ts";

export async function answerQuestion(
  question: string,
  ctx: CommandContext
): Promise<void> {
  ctx.log("Migrant");
  ctx.log("");

  const result = await userQuery(question);

  if (!result?.Answer) {
    throw new Error("No answer was returned for that question.");
  }

  const answer =
    typeof result.Answer === "string"
      ? result.Answer
      : JSON.stringify(result.Answer, null, 2);
  ctx.log(answer);
}

export const askCommand: CommandDefinition = {
  name: "ask",
  description: "Ask a question about your database",
  usage: "/ask <question>",
  requiresAuth: true,
  busyLabel: "Thinking...",
  execute: async (args, ctx) => {
    if (!args.trim()) {
      throw new Error("Usage: /ask <question>");
    }
    await answerQuestion(args.trim(), ctx);
  },
};
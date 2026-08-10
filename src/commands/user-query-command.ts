import { protectedComand } from "@src/exports.ts";
import { userQuery } from "@src/services/query/user_query_service.ts";
import type { Command } from "commander";

export function registerUserQueryCommand(program: Command) {
  program
    .command("ask <questions>")
    .description("Ask about your database!")
    .action((questions) => {
      protectedComand(async () => {
        const allQuestions = questions
          .split(",")
          .map((question: string) => question.trim())
          .filter(Boolean);

        for (const question of allQuestions) {
          await userQuery(question);
        }
        
      })
    });
}
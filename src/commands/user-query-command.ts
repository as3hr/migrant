import { userQuery } from "@src/services/user_query_service.ts";
import type { Command } from "commander";

export function registerUserQueryCommand(program: Command) {
  program
    .command("query")
    .description("Ask about your database!")
    .option("--query <question>", "ask about your database")
    .action((options) => {
      if (options.query) {
        userQuery(options.query);
      }
    });
}

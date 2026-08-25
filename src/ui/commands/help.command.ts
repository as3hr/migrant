import type { CommandDefinition, CommandRegistry } from "../../domain/index.ts";

export function createHelpCommand(
  registry: CommandRegistry
): CommandDefinition {
  return {
    name: "help",
    description: "Show available commands",
    execute: (_args, ctx) => {
      ctx.log("Available commands");
      ctx.log("");
      for (const command of registry.list()) {
        ctx.log(`  /${command.name.padEnd(14)}${command.description}`);
      }
    },
  };
}
import type { CommandDefinition } from "../../domain/index.ts";

export const exitCommand: CommandDefinition = {
  name: "exit",
  description: "Exit Migrant",
  execute: (_args, ctx) => {
    ctx.exit();
  },
};
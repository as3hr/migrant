import type { CommandDefinition } from "@src/exports.ts";

export const exitCommand: CommandDefinition = {
  name: "exit",
  description: "Exit Migrant",
  execute: (_args, ctx) => {
    ctx.exit();
  },
};
import { appContext, type CommandDefinition } from "@src/exports.ts";

export const exitCommand: CommandDefinition = {
  name: "exit",
  description: "Exit Migrant",
  execute: (_args) => {
    const ctx = appContext.commandCtx!;
    ctx.exit();
  },
};
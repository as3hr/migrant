import { type CommandDefinition } from "@src/exports.ts";

export const clearCommand: CommandDefinition = {
  name: "clear",
  description: "Clear the terminal",
  execute: (_args, ctx) => {
    ctx!.clear();
  },
};
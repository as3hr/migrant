import type { CommandDefinition } from "../../domain/index.ts";

export const clearCommand: CommandDefinition = {
  name: "clear",
  description: "Clear the terminal",
  execute: (_args, ctx) => {
    ctx!.clear();
  },
};
import { type CommandDefinition } from "../../domain/index.ts";

export const representCommand: CommandDefinition = {
  name: "represent",
  description: "Open live ER diagram on migrant.as3hr.dev",
  busyLabel: "Opening ER Diagram...",
  requiresAuth: true,
  execute: async (args, ctx) => {
    const dbName = args[0] || "default";
    const url = `https://migrant.as3hr.dev/represent?db=${encodeURIComponent(dbName)}`;
    ctx.success(`Schema ER diagram available at: ${url}`);
  },
};

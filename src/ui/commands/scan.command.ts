import { appContext, type CommandDefinition } from "@src/exports.ts";
import { startScan } from "@src/services/database/schema-scan.service.ts";

export const scanCommand: CommandDefinition = {
  name: "scan",
  description: "Scan the connected database",
  requiresAuth: true,
  requiresConnection: true,
  busyLabel: "Scanning...",
  execute: async (_args) => {
    const ctx = appContext.commandCtx!;
    ctx.log("Scanning database...");
    await startScan();
    ctx.success("Scan complete");
  },
};
import { appContext, startScan, type CommandDefinition } from "@src/exports.ts";
import { pool } from "@src/infrastructure/db/pool.ts";
import { errorMessage } from "./command_helpers.ts";

export const connectCommand: CommandDefinition = {
  name: "connect",
  description: "Connect and Scan the PostgreSQL database",
  busyLabel: "Connecting...",
  execute: async (_args) => {
    const ctx = appContext.commandCtx!;
    ctx.log("PostgreSQL connection");
    ctx.log("");

    const connectionString =
      (await ctx.ask("Connection String", { placeholder: "postgres://username:password@host:port/database" })).trim() ||
      "localhost";
    
    ctx.log("Connecting...");
    ctx.busy("Connecting...");
    await pool.connect(connectionString);
    const database = connectionString.split('/')[3];

    try {
      ctx.success(`Connected to ${database}`);
      ctx.busy("Scanning database...");
      await startScan();
      ctx.success("Scan complete");
    } catch (error) {
      pool.close();
      throw new Error(`Connection failed: ${errorMessage(error)}`);
    }
  },
};
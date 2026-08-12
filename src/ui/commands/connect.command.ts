import { appContext, type CommandDefinition } from "@src/exports.ts";
import { pool } from "@src/infrastructure/db/pool.ts";
import { errorMessage } from "./command_helpers.ts";

export const connectCommand: CommandDefinition = {
  name: "connect",
  description: "Connect a PostgreSQL database",
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
      await pool.query("SELECT 1");
      ctx.success(`Connected to ${database}`);
    } catch (error) {
      pool.close();
      throw new Error(`Connection failed: ${errorMessage(error)}`);
    }
  },
};
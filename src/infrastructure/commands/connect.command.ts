
import { appContext, type CommandContext, type CommandDefinition } from "../../domain/index.ts";
import { pool } from "../../infrastructure/index.ts";
import { errorMessage } from "./command_helpers.ts";

export const connectCommand: CommandDefinition = {
  name: "connect",
  description: "Connect and Scan the PostgreSQL database",
  busyLabel: "Connecting...",
  requiresAuth: true,
  execute: async (args, ctx) => {
    await connectDb(args, ctx);
  },
};

async function connectDb(args: string, ctx: CommandContext) {
  const connectionString = args;  
  const isDbExists = appContext.workspace.dbExists(connectionString);
  if (isDbExists) {
    ctx.error('This database is already connected!');
    return;
  }
  
  ctx.busy("Connecting...");
  
  const db = await pool.setConnection(connectionString);
  const database = connectionString.split('/')[3];

  try {
    ctx.success(`Connected to ${database}`);
  } catch (error) {
    if (db) {
      pool.close(db);
    }
    throw new Error(`Connection failed: ${errorMessage(error)}`);
  }
}

import { appContext, type CommandContext, type CommandDefinition } from "../../domain/index.ts";
import { pool } from "../../infrastructure/index.ts";
import { getDbName } from "../../utils/db_helpers.ts";
import { errorMessage, parseAndValidatePgUrl } from "./command_helpers.ts";

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
  const connectionString = args.trim();

  const parsed = parseAndValidatePgUrl(connectionString);
  if (!parsed.isValid) {
    ctx.error(`Invalid URL: ${parsed.error}`);
    return;
  }

  const normalizedUrl = parsed.normalizedUrl!;
  const dbName = getDbName(normalizedUrl);

  const isDbExists = appContext.workspace.dbExists(normalizedUrl);
  if (isDbExists) {
    ctx.error('This database is already connected!');
    return;
  }

  if (parsed.sslmode) {
    ctx.log(`This connection is using ${parsed.sslmode} sslmode.`);
  }

  ctx.busy(`Connecting to ${dbName}...`);

  let db;
  try {
    db = await pool.setConnection(normalizedUrl);
    ctx.success(`Connected to ${dbName}`);
  } catch (error) {
    if (db) {
      await pool.close(db);
    }
    throw new Error(`Connection failed: ${errorMessage(error)}`);
  }
}
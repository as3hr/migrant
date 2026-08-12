import { appContext, startScan, type CommandContext, type CommandDefinition } from "@src/exports.ts";
import { pool } from "@src/infrastructure/db/pool.ts";
import { errorMessage } from "./command_helpers.ts";

export const connectCommand: CommandDefinition = {
  name: "connect",
  description: "Connect and Scan the PostgreSQL database",
  busyLabel: "Connecting...",
  execute: async (_args, ctx) => {
    await connectDb(ctx);
  },
};

async function connectDb(ctx: CommandContext) {
  const connectionString =
    (await ctx.ask("Connection String", { placeholder: "postgres://username:password@host:port/database" })).trim() ||
    "localhost";
  
  ctx.log("Connecting...");
  ctx.busy("Connecting...");

  const isDbExists = appContext.workspace.dbExists(connectionString);
  if (isDbExists) {
    ctx.error('This database is already connected!');
    await connectDb(ctx);
    return;
  }
  
  await pool.connect(connectionString);
  const database = connectionString.split('/')[3];

  try {
    ctx.success(`Connected to ${database}`);
    ctx.busy("Scanning database...");
    await startScan(ctx);
    ctx.success("Scan complete");
    await askForMoreConnections(ctx);
  } catch (error) {
    pool.close();
    throw new Error(`Connection failed: ${errorMessage(error)}`);
  }
}

async function askForMoreConnections(ctx: CommandContext,) {
  let userInput = await ctx.ask("Would you like to add more databases?", { placeholder: '[Type Y OR N]' });
  await checkYorN(ctx, userInput); 
}

async function checkYorN(ctx: CommandContext, userInput: string) {
  if(userInput === 'N') {
    ctx.success("Scanned Available Databases!!");
  } else if (userInput !== 'Y' && userInput !== 'N') {
    await askForMoreConnections(ctx);
  } else {
    await connectDb(ctx);
  }
}
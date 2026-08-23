import { appContext, getSchemaFingerprint, pool, startScan, type CommandContext, type DatabaseCollection } from "@src/exports.ts";
import { userQuery } from "@src/services/query/user_query.service.ts";

export async function answerQuestion(
  question: string,
  ctx: CommandContext,
): Promise<void> {
  const database = await resolveDatabase(ctx);
  if (!database) return;

  await connectToSelectedDatabase(ctx, database);
  await ensureIndexFresh(database, ctx);
  await userQuery(question, database.id, ctx);
}

async function resolveDatabase(ctx: CommandContext): Promise<DatabaseCollection | undefined> {
  const databases = appContext.workspace.databases;

  if (databases.length === 0) {
    ctx.error("Please connect at least one database using /connect.");
    return;
  }

  if (databases.length === 1) {
    return databases[0];
  }

  const dbMap = new Map<number, DatabaseCollection>();

  databases.forEach((db, index) => {
    dbMap.set(index + 1, db);
  });

  const options = [...dbMap.entries()]
    .map(([number, db]) => `[${number}] ${db.name}`)
    .join("\n");

  const selected = await ctx.ask(
    `Which database should I use?\n${options}`
  );

  const database = dbMap.get(Number(selected));

  if (!database) {
    ctx.error("Invalid database selection.");
    return;
  }

  return database;
}

async function connectToSelectedDatabase(ctx: CommandContext, db: DatabaseCollection) {
  try {
    await pool.setConnection(db.connectionString);
  } catch (error) {
    ctx.error(`Cannot connect to database: ${error}`);
    throw error;
  }
}

async function ensureIndexFresh(
  database: DatabaseCollection,
  ctx: CommandContext
): Promise<void> {
  const liveFingerprint = await getSchemaFingerprint(database.id);
  
  const isStale =
    database.indexStatus !== "ready" ||
    database.schemaFingerprint !== liveFingerprint;

  if (!isStale) return;

  ctx.log("Updating knowledge...");
  await appContext.services.databaseRegistryService.updateDatabase(database.id, {
    indexStatus: "indexing",
  });

  try {
    await startScan(ctx, database.id);
  } catch (err) {
    throw err;
  }
}

import { appContext, pool, startScan, type CommandContext, type DatabaseCollection } from "@src/exports.ts";
import { userQuery } from "@src/services/query/user_query_service.ts";

export async function answerQuestion(
  question: string,
  ctx: CommandContext,
): Promise<void> {
  const databases = appContext.workspace.databases;

  if (databases.length === 0) {
    ctx.error(
      "Please connect at least one database using /connect."
    );
    return;
  }

  if (databases.length === 1) {
    await scanAndFetch(question, databases[0]!, ctx);
    return;
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

  await scanAndFetch(question, database, ctx);
}

async function scanAndFetch(
  question: string,
  database: DatabaseCollection,
  ctx: CommandContext
) {
  if (!database.lastScannedAt) {
    // later we have to decide when to scan the whole structure and when not too.
    // maybe we only fetch the history of db changes and then decide if the structure has to be updated
    // if it has to be updated we should not update the whole documents, we should replace the relevant ones.
    ctx.busy("Connecting...");

    pool.close();
    await pool.connect(database.connectionString);

    ctx.busy("Scanning database...");
    await startScan(ctx);

    appContext.workspace.setLastScanTimeOfDb(database.id);

    ctx.success("Scanned database successfully!");
  }

  ctx.busy("Analyzing query...");
  await userQuery(question, database.id, ctx);
}
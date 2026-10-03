import { appContext, type CommandDefinition } from "../../domain/index.ts";
import { emitEvent } from "../../utils/emitter.ts";

export const renameDbCommand: CommandDefinition = {
  name: "rename-db",
  description: "Rename an active database for beautification",
  requiresAuth: true,
  execute: async (args, ctx) => {
    const actualDbName = args.split(" ")[0];
    const newDbName = args.split(" ")[1];
    if (!actualDbName || !newDbName || newDbName == "" || actualDbName == "") {
      ctx.error("Please provide a new name");
      return;
    }

    const databases = appContext.workspace.databases;
    if (databases.length === 0) {
      ctx.error("No active databases to rename.");
      return;
    }

    let targetDb = databases.find((db) => db.name === actualDbName);
    if (!targetDb) {
      console.error("No database found in the system");
      return;
    }

    await appContext.workspace.updateDb(targetDb!.id, { name: newDbName });
    emitEvent.emit('update-databases');

    ctx.success(`Database renamed to: ${newDbName}`);
  },
};

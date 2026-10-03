import { appContext, type CommandDefinition } from "../../domain/index.ts";
import { emitEvent } from "../../utils/emitter.ts";
import { pool } from "../db/postgres/pool.ts";

export const disconnectCommand: CommandDefinition = {
  name: "disconnect",
  description: "Disconnect an active database",
  requiresAuth: true,
  execute: async (args, ctx) => {
    const activeDbs = appContext.workspace.databases;
    if (activeDbs.length === 0) {
      ctx.error("No active databases to disconnect.");
      return;
    }

    let targetDb = activeDbs[0];
    
    const trimmed = args.trim().toLowerCase();
    if (trimmed) {
      const match = activeDbs.find(db => db.name.toLowerCase() === trimmed || db.id.startsWith(trimmed));
      if (match) {
        targetDb = match;
      } else {
        ctx.error(`No connected database matches: ${args}`);
        return;
      }
    } else if (activeDbs.length > 1) {
       ctx.log("Disconnecting the first active database. Tip: Provide a name to disconnect a specific one.");
    }

    ctx.busy(`Disconnecting ${targetDb!.name}...`);
    await pool.close(targetDb!.id);
    appContext.workspace.removeDbFromWorkspace(targetDb!.id);
    
    emitEvent.emit('update-databases');
    ctx.success(`Disconnected from ${targetDb!.name}`);
  },
};

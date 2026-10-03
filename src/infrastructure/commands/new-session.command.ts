import { appContext, type CommandDefinition } from "../../domain/index.ts";
import { emitEvent } from "../../utils/emitter.ts";

export const newSessionCommand: CommandDefinition = {
  name: "new",
  description: "Start a new chat session",
  requiresAuth: true,
  execute: async (args, ctx) => {
    appContext.currentChatSessionId = undefined;
    emitEvent.emit('update-session', { updatedSession: null });
    
    ctx.success("Started a new session.");
  },
};

import { appContext, type CommandDefinition } from "../../domain/index.ts";
import { emitEvent } from "../../utils/emitter.ts";

export const renameSessionCommand: CommandDefinition = {
  name: "rename",
  description: "Rename the current chat session",
  requiresAuth: true,
  execute: async (args, ctx) => {
    const trimmed = args.trim();
    if (!trimmed) {
      ctx.error("Please provide a new name. Usage: /rename My New Topic");
      return;
    }

    const sessionId = appContext.currentChatSessionId;
    if (!sessionId) {
      ctx.error("You don't have an active session to rename. Send a message first.");
      return;
    }

    const session = await appContext.services.chatSessionService.getSession(sessionId);
    if (!session) {
      ctx.error("Session not found.");
      return;
    }

    session.title = trimmed;
    await appContext.services.chatSessionService.updateSession(session.id, { title: trimmed });

    emitEvent.emit('update-session', { updatedSession: session });
    ctx.success(`Session renamed to: ${trimmed}`);
  },
};

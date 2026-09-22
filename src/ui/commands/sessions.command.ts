import { appContext, type CommandDefinition } from "../../domain/index.ts";

export const sessionsCommand: CommandDefinition = {
  name: "sessions",
  description: "List & switch past chat sessions",
  busyLabel: "Switching session...",
  requiresAuth: true,
  execute: async (args, ctx) => {
    const sessionId = args[0];
    if (sessionId) {
      const session = await appContext.services.chatSessionService.getSession(sessionId);
      if (session) {
        appContext.setCurrentChatSessionId(session.id);
        ctx.success(`Switched to chat session: "${session.title}" (${session.id})`);
      } else {
        ctx.error(`Session not found: ${sessionId}`);
      }
    } else {
      const sessions = await appContext.services.chatSessionService.getSessions();
      if (sessions.length === 0) {
        ctx.log("No past sessions found.");
      } else {
        ctx.log("Past Chat Sessions:");
        sessions.forEach((s) => {
          ctx.log(`  - [${s.id}] ${s.title} (${s.session_token_used} tokens)`);
        });
      }
    }
  },
};

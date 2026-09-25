import { appContext, type CommandDefinition } from "../../domain/index.ts";

export const sessionsCommand: CommandDefinition = {
  name: "sessions",
  description: "List & switch past chat sessions",
  busyLabel: "Switching session...",
  requiresAuth: true,
  execute: async (args, ctx) => {
    const sessionId = args;
    if (sessionId) {
      const session = await appContext.services.chatSessionService.switchSession(sessionId);
      if (session) {
        ctx.success(`Switched to session: "${session.title}"`);
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

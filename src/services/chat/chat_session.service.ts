import { appContext } from "../../domain/index.ts";
import { tblChatMessage, tblChatSessions, type IChatMessageModel, type IChatSessionsModel } from "../../infrastructure/index.ts";
import { emitEvent } from "../../utils/index.ts";

export class ChatSessionService {

    async getSessions(): Promise<IChatSessionsModel[]> {
        const user = await appContext.services.authService.getCurrentUser();
        if (!user) {
            return [];
        }

        return tblChatSessions.getChatSessions(user.id) ?? [];
    }

    async setNewSession(session: IChatSessionsModel): Promise<IChatSessionsModel> {
        const created = tblChatSessions.setChatSession(session);
        if (!created) {
            throw new Error("Failed to create local chat session");
        }
        return created;
    }

    async updateSession(sessionId: string, patch: Partial<IChatSessionsModel>): Promise<IChatSessionsModel | undefined> {
        const session = tblChatSessions.getChatSessionById(sessionId);
        if (!session) return undefined;

        const updated = { ...session, ...patch, updated_at: new Date().toISOString() };
        return tblChatSessions.setChatSession(updated);
    }

    async setChatMessage(sessionId: string, message: IChatMessageModel): Promise<boolean> {
        return tblChatMessage.setChatMessage({
            ...message,
            session_id: sessionId,
        });
    }

    async getSessionMessages(sessionId: string): Promise<IChatMessageModel[]> {
        return tblChatMessage.getChatMessages(sessionId) ?? [];
    }

    async getSession(sessionId: string): Promise<IChatSessionsModel | undefined> {
        return tblChatSessions.getChatSessionById(sessionId);
    }

    async switchSession(sessionId: string): Promise<IChatSessionsModel | undefined> {
        const session = tblChatSessions.getChatSessionById(sessionId);
        if (session) {
            appContext.currentChatSessionId = session.id;
            emitEvent.emit('update-session', {
                updatedSession: session,
                isSwitch: true,
            });
        }
        return session;
    }
}

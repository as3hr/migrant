import { appContext } from "../../domain/index.ts";
import { tblChatMessage, tblChatSessions, type IChatMessageModel, type IChatSessionsModel } from "../../infrastructure/index.ts";

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
}

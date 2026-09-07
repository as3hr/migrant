import { randomUUID } from "node:crypto";
import { appContext, type KnowledgeDocument } from "../../domain/index.ts";
import { tblChatMessage, tblChatSessions, tblDocuments, type IChatMessageModel, type IChatSessionsModel } from "../../infrastructure/index.ts";
import { SYS_DEFAULT_EMBEDDING_MODEL } from "../../utils/index.ts";

export class ChatSessionService {
    async reindexDocuments(
        dbId: string,
        embeddings: number[][],
        knowledgeDocuments: KnowledgeDocument[],
        model?: string
    ): Promise<boolean> {
        tblDocuments.deleteDocumentsByDatabase(dbId);

        const rows = embeddings.map((embedding, index) => ({
            id: randomUUID(),
            database_id: dbId,
            content: knowledgeDocuments[index]!.content,
            document_type: knowledgeDocuments[index]!.type,
            embedding_model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
            embedding: JSON.stringify(embedding),
            metadata: JSON.stringify(knowledgeDocuments[index]!.metadata ?? {}),
            created_at: new Date().toISOString(),
        }));

        tblDocuments.setDocuments(rows);
        return true;
    }

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

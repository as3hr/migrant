import { sqlLite } from "./sqlite.client.ts";
import type { DbChatMessageRowType, DbChatSessionType } from "../../../types/table_types.ts";

class LocalChatRepository {
    private chatSessionInsertStmt;
    private chatSessionSelectStmt;
    private chatSessionSelectByIdStmt;
    private chatSessionDeleteStmt;

    private chatMessageInsertStmt;
    private chatMessageSelectStmt;

    constructor() {
        this.chatSessionInsertStmt = sqlLite.prepare(
            'INSERT OR REPLACE INTO chat_sessions (id, user_id, title, session_token_limit, session_token_used, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        this.chatSessionSelectStmt = sqlLite.prepare(
            'SELECT * FROM chat_sessions WHERE user_id = ? order by updated_at desc'
        );
        this.chatSessionSelectByIdStmt = sqlLite.prepare(
            'SELECT * FROM chat_sessions WHERE id = ?'
        );
        this.chatSessionDeleteStmt = sqlLite.prepare(
            'DELETE FROM chat_sessions WHERE id = ?'
        );

        this.chatMessageInsertStmt = sqlLite.prepare(
            'INSERT OR REPLACE INTO chat_messages (id, user_id, session_id, content, provider, role, model_name, target_agent, prompt_tokens, completion_tokens, total_tokens, cost_usd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        this.chatMessageSelectStmt = sqlLite.prepare(
            'SELECT * FROM chat_messages WHERE session_id = ?'
        );
    }

    setChatSession(chatSession: DbChatSessionType): void { 
        this.chatSessionInsertStmt.run(
            chatSession.id, 
            chatSession.user_id, 
            chatSession.title, 
            chatSession.session_token_limit, 
            chatSession.session_token_used, 
            chatSession.created_at,
            chatSession.updated_at
        );
    }

    getChatSessions(userId: string) { 
        return this.chatSessionSelectStmt.all(userId) as DbChatSessionType[];
    }

    getChatSessionById(sessionId: string) { 
        return this.chatSessionSelectByIdStmt.get(sessionId) as DbChatSessionType | undefined;
    }

    deleteChatSession(userId: string): boolean {
        const info = this.chatSessionDeleteStmt.run(userId);
        return info.changes > 0;
    }

    setChatMessage(message: DbChatMessageRowType): boolean {
        const info = this.chatMessageInsertStmt.run(
            message.id,
            message.user_id,
            message.session_id,
            message.content,
            message.provider,
            message.role,
            message.model_name,
            message.target_agent,
            message.prompt_tokens,
            message.completion_tokens,
            message.total_tokens,
            message.cost_usd,
            message.created_at
        );
        return info.changes > 0;
    }

    getChatMessages(sessionId: string): DbChatMessageRowType[] {
        return this.chatMessageSelectStmt.all(sessionId) as DbChatMessageRowType[];
    }
}

export const localChatRepository = new LocalChatRepository();
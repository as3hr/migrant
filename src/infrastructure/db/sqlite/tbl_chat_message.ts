import { sqlClient } from "../index.ts";

export interface IChatMessageModel {
    id: string;
    user_id: string;
    role: string;
    content: string;
    session_id: string;
    provider: string;
    model_name: string;
    target_agent: string;
    cost_usd: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    created_at: string;
};

class TblChatMessage {
    private chatMessageInsertStmt;
    private chatMessageSelectStmt;

    constructor() {
        this.chatMessageInsertStmt = sqlClient.prepare(
            'INSERT OR REPLACE INTO tbl_chat_messages (id, user_id, session_id, content, provider, role, model_name, target_agent, prompt_tokens, completion_tokens, total_tokens, cost_usd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        this.chatMessageSelectStmt = sqlClient.prepare(
            'SELECT * FROM tbl_chat_messages WHERE session_id = ?'
        );
    }
    
    initializeTblChatMessage() {
        sqlClient.run(`
            CREATE TABLE IF NOT EXISTS tbl_chat_messages (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                content TEXT NOT NULL,
                provider TEXT NOT NULL,
                role TEXT NOT NULL,
                model_name TEXT NOT NULL,
                target_agent TEXT NOT NULL,
                prompt_tokens BIGINT NOT NULL DEFAULT 0,
                completion_tokens BIGINT NOT NULL DEFAULT 0,
                total_tokens BIGINT NOT NULL DEFAULT 0,
                cost_usd REAL NOT NULL DEFAULT 0.0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    setChatMessage(message: IChatMessageModel): boolean {
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
    
    getChatMessages(sessionId: string): IChatMessageModel[] {
        return this.chatMessageSelectStmt.all(sessionId) as IChatMessageModel[];
    }
}

export const tblChatMessage = new TblChatMessage();
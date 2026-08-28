import { appContext, type KnowledgeDocument } from "../../domain/index.ts";
import { supabase } from "../../infrastructure/index.ts";
import { localChatRepository } from "../../local/index.ts";
import type { DbChatMessageRowType, DbChatSessionType } from "../../types/table_types.ts";
import { SYS_DEFAULT_EMBEDDING_MODEL } from "../../utils/index.ts";

export class DatabaseService {
    async reindexDocuments(
        dbId: string,
        embeddings: number[][],
        knowledgeDocuments: KnowledgeDocument[],
        model?: string
    ): Promise<boolean> {
        const batchId = crypto.randomUUID();
        
        const rows = embeddings.map((embedding, index) => ({
            content: knowledgeDocuments[index]!.content,
            embedding: `[${embedding.join(",")}]`,
            embedding_model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
            database_id: dbId,
            document_type: knowledgeDocuments[index]!.type,
            metadata: knowledgeDocuments[index]!.metadata,
            batch_id: batchId,
        }));

        const { error } = await supabase
            .from('documents')
            .insert(rows);

        if (error) {
          throw new Error(`Index generation failed: ${error.message}`);
        }

        await supabase
            .from('documents')
            .delete()
            .eq('database_id', dbId)
            .neq('batch_id', batchId);

        return true;
    }

    async getSessions(): Promise<DbChatSessionType[]> {
        const user = await appContext.services.authService.getCurrentUser();
        if (!user) {
            return [];
        }

        const existingSessions = localChatRepository.getChatSessions(user.id);
        if (existingSessions) return existingSessions;

        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
          throw new Error(`Failed to retrieve sessions: ${error.message}`);
        }

        return data ?? [];
    }

    async setNewSession(session: Omit<DbChatSessionType, 'id'>) {
        const { data, error } = await supabase.from('chat_sessions').insert(session).select().maybeSingle();
        
        if (error || !data) {
            throw new Error(`Failed to create session: ${error?.message ?? 'Unknown error'}`);
        }

        localChatRepository.setChatSession(data);

        return data;
    }

    async setChatMessage(sessionId: string, message: Omit<DbChatMessageRowType, 'id' | 'session_id'>) {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                ...message,
                session_id: sessionId,
            }).select().maybeSingle();

        if (error || !data) {
            throw new Error(`Failed to store model response: ${error?.message}`);
        }

        localChatRepository.setChatMessage(data);

        return true;
    }

    async getSessionMessages(sessionId: string) {
        const messages = localChatRepository.getChatMessages(sessionId);
        if (messages.length > 0) return messages;

        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId);

        if (error) {
            throw new Error(`Failed to retrieve messages: ${error.message}`);
        }

        return data ?? [];
    }

    async getSession(sessionId: string) {
        const session = localChatRepository.getChatSessionById(sessionId);
        if (session) return session;

        const user = await appContext.services.authService.getCurrentUser();
        if (!user) {
            return null;
        }
        
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to retrieve session: ${error.message}`);
        }

        return data;
    }
}
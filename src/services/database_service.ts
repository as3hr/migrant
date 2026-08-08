import { pool, supabase, SYS_DEFAULT_EMBEDDING_MODEL, type KnowledgeDocument } from "@src/exports.ts";

class DatabaseService {
    async createEmbeddingsInDatabase(embedding: number[], knowledgeDocument: KnowledgeDocument, model?: string): Promise<boolean> {
        const { error } = await supabase.from("documents").insert({
            user_id: 1,
            content: knowledgeDocument.content,
            embedding: `[${embedding.join(",")}]`,
            embedding_model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
            database_id: pool.dbId ?? '',
            document_type: knowledgeDocument.type,
            metadata: knowledgeDocument.metadata,
        });

        if (error) console.log(`Error while inserting embedding record into the db`, error);

        return true;
    }
}

export const dbService = new DatabaseService();
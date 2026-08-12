import { authService, pool, supabase, SYS_DEFAULT_EMBEDDING_MODEL, type KnowledgeDocument } from "@src/exports.ts";

export class DatabaseService {
    async createDatabaseEntry(): Promise<boolean> {
        const user = await authService.getCurrentUser();
        if (!user) {
            console.log('User not found in database service');
            return false;
        }
        const { error } = await supabase.from("Database").insert({
            database_identifier: pool.dbId ?? '',
            user_id: user?.id,
        });

        if (error) console.log(`Error while inserting embedding record into the db`, error);

        return true;
    }

    async createEmbeddingsInDatabase(embedding: number[], knowledgeDocument: KnowledgeDocument, model?: string): Promise<boolean> {
        const { error } = await supabase.from("documents").insert({
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
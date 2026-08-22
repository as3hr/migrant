import {
    pool,
    supabase,
    SYS_DEFAULT_EMBEDDING_MODEL,
    type KnowledgeDocument
} from "@src/exports.ts";

export class DatabaseService {
    async reindexDocuments(
        embeddings: number[][],
        knowledgeDocuments: KnowledgeDocument[],
        model?: string
    ): Promise<boolean> {
        if (!pool.dbId) {
            console.error("[DatabaseService] No active dbId on pool — cannot reindex.");
            return false;
        }

        const batchId = crypto.randomUUID();
        
        const rows = embeddings.map((embedding, index) => ({
            content: knowledgeDocuments[index]!.content,
            embedding: `[${embedding.join(",")}]`,
            embedding_model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
            database_id: pool.dbId!,
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
            .eq('database_id', pool.dbId)
            .neq('batch_id', batchId);

        return true;
    }
}
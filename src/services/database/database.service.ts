import {
    supabase,
    SYS_DEFAULT_EMBEDDING_MODEL,
    type KnowledgeDocument
} from "@src/exports.ts";

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
}
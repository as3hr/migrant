import {
    pool,
    supabase,
    SYS_DEFAULT_EMBEDDING_MODEL,
    type KnowledgeDocument,
} from "@src/exports.ts";

/**
 * DatabaseService — pure Supabase infrastructure for documents/embeddings.
 *
 * This service only handles the documents table.
 * It does NOT update the "Database" table, does NOT touch WorkSpace,
 * and does NOT fetch schema fingerprints.
 *
 * Database record management (id lookup, metadata updates) belongs to
 * DatabaseRegistryService.
 */
export class DatabaseService {
    /**
     * Replace all indexed documents for the current database.
     * Deletes stale docs first, then inserts the new batch.
     * Returns true on success.
     */
    async reindexDocuments(
        embeddings: number[][],
        knowledgeDocuments: KnowledgeDocument[],
        model?: string
    ): Promise<boolean> {
        if (!pool.dbId) {
            console.error("[DatabaseService] No active dbId on pool — cannot reindex.");
            return false;
        }

        // 1. Delete stale documents before inserting new ones
        const { error: deleteError } = await supabase
            .from("documents")
            .delete()
            .eq("database_id", pool.dbId);

        if (deleteError) {
            console.error("[DatabaseService] Failed to delete stale documents:", deleteError.message);
            return false;
        }

        // 2. Insert new embeddings
        const rows = embeddings.map((embedding, index) => ({
            content: knowledgeDocuments[index]!.content,
            embedding: `[${embedding.join(",")}]`,
            embedding_model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
            database_id: pool.dbId!,
            document_type: knowledgeDocuments[index]!.type,
            metadata: knowledgeDocuments[index]!.metadata,
        }));

        const { error: insertError } = await supabase
            .from("documents")
            .insert(rows);

        if (insertError) {
            console.error("[DatabaseService] Failed to insert embeddings:", insertError.message);
            return false;
        }

        return true;
    }
}
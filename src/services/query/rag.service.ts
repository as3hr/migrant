import { appContext, supabase, type DatabaseCollection } from "@src/exports.ts";
import type { Json } from "@src/types/database.types.ts";

interface SemanticSearchResult {
    id: string;
    content: string;
    document_type: string;
    database_id: string;
    embedding_model: string;
    distance: number;
    metadata: Json;
}

interface SemanticSearchResponse {
    database: DatabaseCollection;
    context: string;
    documentsData: SemanticSearchResult[];
}

export class RagService {
    async performSemanticSearch(query: string, database: DatabaseCollection, match_count?: number): Promise<SemanticSearchResponse | null> {
        try { 
            const embedding = await appContext.services.embeddingService.createSingleEmbedding([query]);
            const queryEmbedding = `[${embedding.join(",")}]`;

            const { data, error } = await supabase.rpc("match_documents", {
                query_embedding: queryEmbedding,
                match_count: match_count ?? 5,
                target_database_id: database.id,
            });

            if (error) {
                console.error("Error retrieving documents:", error);
                return null;
            }

            const context = data
                .map((doc: SemanticSearchResult, index: number) => {
                    return `
                        <Document ${index + 1}>
                            Type: ${doc.document_type ?? "unknown"}
                            Content: ${doc.content}
                            MetaData: ${doc.metadata}
                        </Document ${index + 1}>
                        `;
                    })
                .join("\n");
            
            return {
                database,
                context,
                documentsData: data
            }
        } catch (e) {
            console.log('Error in performing semantic search', e);
            return null;
        }
    }
}
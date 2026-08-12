import { embeddingService, supabase } from "@src/exports.ts";
import type { Json } from "@src/types/database.types.ts";

interface SemanticSearchResult {
    id: number;
    content: string;
    document_type: string;
    embedding_model: string;
    distance: number;
    metadata: Json;
}

interface SemanticSearchResponse {
    context: string;
    documentsData: SemanticSearchResult[];
}

export class RagService {
    async performSemanticSearch(query: string, match_count?: number): Promise<SemanticSearchResponse | null> {
        try { 
            const embedding = await embeddingService.createSingleEmbedding([query]);
            const queryEmbedding = `[${embedding.join(",")}]`;

            const { data, error } = await supabase.rpc("match_documents", {
                query_embedding: queryEmbedding,
                match_count: match_count ?? 5,
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
                context,
                documentsData: data
            }
        } catch (e) {
            console.log('Error in performing semantic search', e);
            return null;
        }
    }
}


export const ragService = new RagService();
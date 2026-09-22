import { appContext, type DatabaseCollection } from "../../domain/index.ts";
import { tblDocuments } from "../../infrastructure/db/sqlite/tbl_documents.ts";
import type { Json } from "../../types/database.types.ts";

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

            const data = tblDocuments.matchDocuments(
                embedding,
                database.id,
                match_count ?? 5
            );

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
            appContext.commandCtx?.log(`Error in performing semantic search ${e}`)
            return null;
        }
    }
}
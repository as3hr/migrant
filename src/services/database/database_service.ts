import {
    appContext,
    pool,
    supabase,
    SYS_DEFAULT_EMBEDDING_MODEL,
    type KnowledgeDocument
} from "@src/exports.ts";
import { createHash } from "crypto";

export class DatabaseService {
    async createDatabaseEntry(): Promise<string | null> {
        const user = await appContext.services.authService.getCurrentUser();
    
        if (!user?.id) {
            return null;
        }
    
        if (!pool.dbUrl) {
            return null;
        }
    
        const url = new URL(pool.dbUrl);
    
        const identity =
            `${url.hostname}:${url.port || "5432"}${url.pathname}`;
    
        const dbIdentifier = createHash("sha256")
            .update(identity)
            .digest("hex");
    
        const { data, error } = await supabase
            .from("Database")
            .select("id")
            .eq("database_identifier", dbIdentifier)
            .eq("user_id", user.id)
            .maybeSingle();
    
        if (error) {
            throw new Error(`Failed to find database: ${error.message}`);
        }   
        if (data) {
            return data.id;
        }
    
        const { data: inserted, error: insertError } = await supabase
            .from("Database")
            .insert({
                database_identifier: dbIdentifier,
                user_id: user.id,
            })
            .select("id")
            .single();
    
        if (insertError) {
            throw new Error(
                `Failed to create database record: ${insertError.message}`,
            );
        }
    
        return inserted.id;
    }
    
    async createEmbeddingsInDatabase(
        embeddings: number[][],
        knowledgeDocuments: KnowledgeDocument[],
        model?: string
      ): Promise<boolean> {
        const rows = embeddings.map((embedding, index) => ({
          content: knowledgeDocuments[index]!.content,
          embedding: `[${embedding.join(",")}]`,
          embedding_model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
          database_id: pool.dbId ?? "",
          document_type: knowledgeDocuments[index]!.type,
          metadata: knowledgeDocuments[index]!.metadata,
        }));
      
        const { error } = await supabase
          .from("documents")
          .insert(rows);
      
        if (error) {
          console.error("Failed to insert embeddings:", error);
          return false;
        }
      
        return true;
      }
}
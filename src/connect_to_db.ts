import { aiService } from "./cli.ts";
import { pool, supabase } from "./config/db.config.ts";
import asyncHandler from "./utils/async_handler.ts";

export const logSampleData = asyncHandler(async (): Promise<string> => { 
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const data = result.rows;
    const embeddings = await aiService.createEmbeddings(data);
    const { data: inserted, error } = await supabase
        .from("documents")
        .insert({
            user_id: 1,
            content: JSON.stringify(data),
            embedding: JSON.stringify(embeddings),
            embedding_model: "text-embedding-3-small",
            document_type: "schema",
            database_id: pool.dbId ?? "",
        })
        .select();
    
    if (error) {
        throw new Error(error.message);
    }
    
    console.log("Inserted:", inserted);
    return `Embeddings created for ${data.length} rows, ${embeddings} embeddings created`;
});




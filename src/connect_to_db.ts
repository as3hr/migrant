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

export const matchDocuments = asyncHandler(async () => {
    const query = "What changes were made to the users table?";

const queryEmbedding =
    await aiService.createEmbeddings(query);

const { data, error } = await supabase.rpc(
    "match_documents",
    {
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: 5,
    }
);

if (error) {
    throw new Error(error.message);
}

console.log(data);
})




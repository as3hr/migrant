import { aiUtilities } from "./cli.ts";
import { pool } from "./config/db.config.ts";
import asyncHandler from "./utils/async_handler.ts";

export const logSampleData = asyncHandler(async (): Promise<any> => { 
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const data = result.rows;
    const embeddings = await aiUtilities.createEmbeddings(data);
    // steps 
    // 1. get the embeddings of this data
    // 2. save the embeddings to the supabase pg_vector db //later
    return `Embeddings created for ${data.length} rows, ${embeddings} embeddings created`;
});

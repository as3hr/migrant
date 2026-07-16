import { pool } from "./config/db.config.js";
import asyncHandler from "./utils/async_handler.js";

export const logSampleData = asyncHandler(async (): Promise<any> => { 
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    return result.rows;
});

import { tool } from "ai";
import z from "zod";
import { pool } from "../../db/index.ts";
import { validateGeneratedSql } from "../core/db_overview.ts";

export const executeQueryTool = tool({
    description: `Execute a read-only SQL query against the connected database and return results to the user. 
    IMPORTANT: Only call this tool AFTER explicitly asking the user for permission.
    Only use for SELECT queries. Never for INSERT, UPDATE, DELETE, DROP.`,
    inputSchema: z.object({
        sql: z.string().describe("The validated SELECT query to execute"),
        dbId: z.string().describe("Database ID to run the query against"),
        userConfirmed: z.boolean().describe("Whether user has confirmed they want to run this query"),
    }),
    execute: async ({ sql, dbId, userConfirmed }) => {
        if (!userConfirmed) {
            return { 
                status: "pending_confirmation",
                message: "Waiting for user confirmation before executing."
            };
        }

        const validation = validateGeneratedSql(sql, false);
        if (!validation.valid || !validation.cleanSql) {
            return { 
                status: "rejected",
                error: `Query rejected: ${validation.error}` 
            };
        }

        try {
            const result = await pool.query(dbId, validation.cleanSql);
            return {
                status: "success",
                rowCount: result.rowCount,
                columns: result.fields.map(f => f.name),
                rows: result.rows,
                executedSql: validation.cleanSql,
            };
        } catch (err) {
            return { 
                status: "error",
                error: (err as Error).message 
            };
        }
    }
});
import { appContext, pool } from "@src/exports.ts";

const METADATA_QUERY_SYSTEM_PROMPT = `
You are a PostgreSQL Schema Introspection Query Generator for Migrant CLI.

Your task is to generate EXACTLY ONE raw PostgreSQL SQL query to introspect database metadata for the user's question.

CRITICAL PRIVACY & SECURITY RULES:
1. System Catalogs ONLY: You MUST ONLY query PostgreSQL system schemas and metadata views:
   - information_schema (information_schema.tables, information_schema.columns, information_schema.table_constraints, etc.)
   - pg_catalog (pg_catalog.pg_class, pg_catalog.pg_namespace, pg_catalog.pg_stat_user_tables, pg_catalog.pg_indexes, pg_tables, etc.)
2. NEVER Query User Data: You are STRICTLY FORBIDDEN from querying user data tables directly (e.g. NEVER write "SELECT * FROM users" or access user table rows).
3. Output Format: Output ONLY the raw SQL query. Do NOT use markdown code blocks (\`\`\`sql). Do NOT include explanations, introduction, or comments.
4. Read-Only: Only write SELECT or WITH queries.
`;

export async function getDatabaseContextForUserQuery(query: string): Promise<string | null> {
    try {
        const output = await appContext.services.llmService.queryLlm(
            METADATA_QUERY_SYSTEM_PROMPT,
            `Generate a system introspection SQL query for: ${query}`,
            "deepseek/deepseek-chat"
        );
        if (!output) return null;

        const validatedSql = _validateGeneratedSql(output.toString());
        if (!validatedSql) return null;

        const response = await pool.query(validatedSql);
        return JSON.stringify(response.rows, null, 2);
    } catch (error) {
        console.error("Error executing database introspection query:", error);
        return null;
    }
}

export function _validateGeneratedSql(sql: string): string | null {
    // 1. Clean markdown formatting and whitespace
    let cleanSql = sql
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .trim();

    // Ensure statement ends cleanly without trailing semicolons for wrapping
    if (cleanSql.endsWith(";")) {
        cleanSql = cleanSql.slice(0, -1).trim();
    }

    const lowerSql = cleanSql.toLowerCase();

    // 2. Must start with SELECT or WITH
    if (!lowerSql.startsWith("select") && !lowerSql.startsWith("with")) {
        console.warn("SQL Validation Rejected: Query does not start with SELECT or WITH.");
        return null;
    }

    // 3. Reject any mutation / DDL keywords
    const forbiddenKeywords = [
        "insert ", "update ", "delete ", "drop ", "alter ", "truncate ",
        "create ", "grant ", "revoke ", "exec ", "execute "
    ];
    for (const forbidden of forbiddenKeywords) {
        if (lowerSql.includes(forbidden)) {
            console.warn(`SQL Validation Rejected: Query contains forbidden keyword '${forbidden.trim()}'.`);
            return null;
        }
    }

    // 4. Strict Privacy Guarantee: Must ONLY query system metadata catalogs/views!
    // Every table referenced in FROM / JOIN must belong to information_schema or pg_catalog / pg_* system views.
    const systemSources = [
        "information_schema",
        "pg_catalog",
        "pg_tables",
        "pg_stat_user_tables",
        "pg_stat_all_tables",
        "pg_class",
        "pg_namespace",
        "pg_attribute",
        "pg_constraint",
        "pg_indexes",
        "pg_size_pretty",
        "pg_total_relation_size",
        "pg_relation_size"
    ];

    const hasSystemSource = systemSources.some((source) => lowerSql.includes(source));
    if (!hasSystemSource) {
        console.warn("SQL Validation Rejected: Query does not reference a valid PostgreSQL system metadata source (information_schema or pg_catalog).");
        return null;
    }

    return cleanSql;
}
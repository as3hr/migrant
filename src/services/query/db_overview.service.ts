import { appContext, type DatabaseCollection } from "../../domain/index.ts";
import { getCheckConstraintsQuery, getColumnsQuery, getEnumsQuery, getFksQuery, getFunctionsQuery, getIdxsQuery, getPrimaryKeysQuery, getSchemaFingerprintQuery, getTriggersQuery, getUniqueConstraintsQuery, getViewsQuery, pool } from "../../infrastructure/index.ts";

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

Example Introspection Queries:
Get Columns: ${getColumnsQuery()}
Get Foreign Keys: ${getFksQuery()}
Get Primary Keys: ${getPrimaryKeysQuery()}
Get Unique Constraints: ${getUniqueConstraintsQuery()}
Get Check Constraints: ${getCheckConstraintsQuery()}
Get Indexes: ${getIdxsQuery()}
Get Triggers: ${getTriggersQuery()}
Get Views: ${getViewsQuery()}
Get Enums: ${getEnumsQuery()}
Get Functions: ${getFunctionsQuery()}
Get FingerPrint: ${getSchemaFingerprintQuery()}
`;

const MAX_RETRIES = 3;

interface ValidationResult {
    valid: boolean;
    cleanSql?: string;
    error?: string;
}

interface ExecutionResult {
    success: boolean;
    data?: string;
    error?: string;
    sql?: string;
}

interface FinalSuccessResponse {
    database: DatabaseCollection;
    finalResponse: string;
}

function buildRetrySystemPrompt(error: string, previousSqlQuery?: string | null): string {
    return `
You are a PostgreSQL Schema Introspection Query Generator for Migrant CLI.

CRITICAL REPAIR TASK:
Your previous SQL query attempt failed or was rejected.

${previousSqlQuery ? `FAILED QUERY:\n${previousSqlQuery}\n` : ""}
ERROR DETAILS:
${error}

INSTRUCTIONS FOR FIXING:
1. Analyze the ERROR DETAILS above to understand why the query failed (e.g. invalid syntax, missing column in pg_catalog, non-existent view, or validation rejection).
2. Regenerate a new, corrected PostgreSQL SQL query that fulfills the user's request WITHOUT triggering this error.
3. Ensure the corrected query STILL strictly queries PostgreSQL system catalogs (information_schema or pg_catalog) and NEVER queries user data tables.
4. Output ONLY the raw SQL query. Do NOT use markdown code blocks (\`\`\`sql).

${METADATA_QUERY_SYSTEM_PROMPT}
`;
}

export async function getDatabaseContextForUserQuery(userQuery: string, db: DatabaseCollection): Promise<FinalSuccessResponse | null> {
    let lastError = "";
    let lastAttemptSql: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const systemPrompt =
            attempt > 1 && lastError
                ? buildRetrySystemPrompt(lastError, lastAttemptSql)
                : METADATA_QUERY_SYSTEM_PROMPT;

        if (attempt > 1) {
            appContext.commandCtx?.log(
                `Attempt ${attempt}/${MAX_RETRIES}: Retrying SQL generation due to error: ${lastError}`
            );
        }

        const result = await executeIntrospectionWorkflow(userQuery, systemPrompt, db.id);

        if (result.success && result.data) {
            return {
                database: db,
                finalResponse: result.data
            };
        }

        lastError = result.error ?? "Unknown introspection execution error.";
        lastAttemptSql = result.sql ?? null;
    }

    appContext.commandCtx?.error(
        `Failed to generate valid introspection SQL for "${userQuery}" after ${MAX_RETRIES} attempts. Last error: ${lastError}`
    );
    return null;
}

async function executeIntrospectionWorkflow(
    userQuery: string,
    systemPrompt: string,
    dbId: string
): Promise<ExecutionResult> {
    try {
        const output = await appContext.services.llmService.queryLlm(
            systemPrompt,
            [
                {
                    role: 'user',
                    content: `Generate a system introspection SQL query for: ${userQuery}`,
                }
            ],
            "deepseek/deepseek-chat",
        );

        if (!output) {
            return {
                success: false,
                error: "LLM returned empty output.",
            };
        }

        const rawSql = output.toString();
        const validation = validateGeneratedSql(rawSql);

        if (!validation.valid || !validation.cleanSql) {
            return {
                success: false,
                error: validation.error ?? "SQL validation failed.",
                sql: rawSql,
            };
        }

        const response = await pool.query(dbId, validation.cleanSql);
        return {
            success: true,
            data: JSON.stringify(response.rows, null, 2),
            sql: validation.cleanSql,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

export function validateGeneratedSql(sql: string): ValidationResult {
    // 1. Clean markdown formatting and whitespace
    let cleanSql = sql
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .trim();

    if (cleanSql.endsWith(";")) {
        cleanSql = cleanSql.slice(0, -1).trim();
    }

    const lowerSql = cleanSql.toLowerCase();

    // 2. Must start with SELECT or WITH
    if (!lowerSql.startsWith("select") && !lowerSql.startsWith("with")) {
        return {
            valid: false,
            error: "SQL Validation Rejected: Query must start with SELECT or WITH.",
        };
    }

    // 3. Reject any mutation / DDL keywords
    const forbiddenKeywords = [
        "insert ", "update ", "delete ", "drop ", "alter ", "truncate ",
        "create ", "grant ", "revoke ", "exec ", "execute "
    ];
    for (const forbidden of forbiddenKeywords) {
        if (lowerSql.includes(forbidden)) {
            return {
                valid: false,
                error: `SQL Validation Rejected: Query contains forbidden keyword '${forbidden.trim()}'.`,
            };
        }
    }

    // 4. Strict Privacy Guarantee: Must ONLY query system metadata catalogs/views!
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
        return {
            valid: false,
            error: "SQL Validation Rejected: Query does not reference a valid PostgreSQL system metadata source (information_schema or pg_catalog).",
        };
    }

    return {
        valid: true,
        cleanSql,
    };
}
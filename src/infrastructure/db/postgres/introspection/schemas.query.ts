import { pool } from "../pool.ts";

export async function getSchemas(dbId: string): Promise<string[]> {
  const result = await pool.query(dbId, getSchemasQuery());

  return result.rows.map((row: any) => row.schema_name as string);
}

export function getSchemasQuery(): string {
  return `
    SELECT nspname AS schema_name
    FROM pg_namespace
    WHERE nspname NOT LIKE 'pg_%'
      AND nspname NOT IN (
        'information_schema',
        'auth',
        'storage',
        'realtime',
        'audit',
        'vault',
        'graphql',
        'pgbouncer'
      )
    ORDER BY nspname;
  `;
}
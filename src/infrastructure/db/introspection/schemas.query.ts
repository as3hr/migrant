import { pool } from "../index.ts";

export async function getSchemas(dbId: string): Promise<string[]> {
  const result = await pool.query(dbId, getSchemasQuery());

  return result.rows.map((row: any) => row.schema_name as string);
}

export function getSchemasQuery(): string {
  return `
    SELECT nspname AS schema_name
    FROM pg_namespace
    WHERE nspname NOT LIKE 'pg_%'
      AND nspname <> 'information_schema'
    ORDER BY nspname;
  `;
}
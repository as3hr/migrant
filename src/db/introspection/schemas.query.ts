import { pool } from "@src/exports.ts";

export async function getSchemas(): Promise<string[]> {
  const result = await pool.query(`
    SELECT nspname AS schema_name
    FROM pg_namespace
    WHERE nspname NOT LIKE 'pg_%'
      AND nspname <> 'information_schema'
    ORDER BY nspname;
  `);

  return result.rows.map(row => row.schema_name as string);
}

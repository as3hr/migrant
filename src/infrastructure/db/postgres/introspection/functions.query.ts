import type { DatabaseFunction } from "../../../../domain/index.ts";
import { pool } from "../pool.ts";

export async function getFunctions(
  schema: string,
  dbId: string
): Promise<DatabaseFunction[]> {
  const result = await pool.query(dbId, getFunctionsQuery(), [schema]);

  return result.rows.map((row: any) => ({
    schemaName: schema,
    name: row.function_name,
    arguments: row.arguments ?? [],
    returnType: row.return_type,
    language: row.language,
    body: row.body,
  }));
}

export function getFunctionsQuery(): string {
  return `
    SELECT
      p.proname AS function_name,

      COALESCE(
        (
          SELECT json_agg(
            format_type(arg_type, NULL)
            ORDER BY ord
          )
          FROM unnest(p.proargtypes)
            WITH ORDINALITY AS args(arg_type, ord)
        ),
        '[]'::json
      ) AS arguments,

      pg_get_function_result(p.oid) AS return_type,

      l.lanname AS language,

      pg_get_functiondef(p.oid) AS body

    FROM pg_proc p

    JOIN pg_namespace n
      ON n.oid = p.pronamespace

    JOIN pg_language l
      ON l.oid = p.prolang

    WHERE n.nspname = $1

    ORDER BY p.proname
  `;
}
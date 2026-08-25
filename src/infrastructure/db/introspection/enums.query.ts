import type { EnumType } from "../../../domain/index.ts";
import { pool } from "../index.ts";

export async function getEnums(schema: string, dbId: string): Promise<EnumType[]> {
  const result = await pool.query(dbId, getEnumsQuery(), [schema]);

  return result.rows.map((row: any) => ({
    schemaName: schema,
    name: row.enum_name,
    values: row.values ?? [],
  }));
}

export function getEnumsQuery(): string {
  return `
    SELECT
      t.typname AS enum_name,

      json_agg(
        e.enumlabel
        ORDER BY e.enumsortorder
      ) AS values

    FROM pg_type t

    JOIN pg_enum e
      ON e.enumtypid = t.oid

    JOIN pg_namespace n
      ON n.oid = t.typnamespace

    WHERE n.nspname = $1

    GROUP BY
      t.typname

    ORDER BY t.typname
  `;
}
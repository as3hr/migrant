import { pool, type View } from "@src/exports.ts";

export async function getViews(schema: string, dbId: string): Promise<Record<string, View>> {
  const result = await pool.query(dbId, getViewsQuery(), [schema]);

  const views: Record<string, View> = {};

  for (const row of result.rows) {
    const key = `${schema}.${row.view_name}`;

    views[key] = {
      schemaName: schema,
      name: row.view_name,
      definition: row.definition,
      referencedTables: row.referenced_tables ?? [],
    };
  }

  return views;
}

export function getViewsQuery(): string {
  return `
    SELECT
      v.viewname AS view_name,
      v.definition,

      COALESCE(
        (
          SELECT json_agg(DISTINCT ref.relname)
          FROM pg_depend d
          JOIN pg_rewrite r
            ON r.oid = d.objid
          JOIN pg_class ref
            ON ref.oid = d.refobjid
          JOIN pg_namespace ref_ns
            ON ref_ns.oid = ref.relnamespace
          WHERE r.ev_class = c.oid
            AND ref.relkind IN ('r', 'p', 'v', 'm')
            AND ref_ns.nspname = $1
        ),
        '[]'::json
      ) AS referenced_tables

    FROM pg_views v

    JOIN pg_class c
      ON c.relname = v.viewname

    JOIN pg_namespace ns
      ON ns.oid = c.relnamespace
      AND ns.nspname = v.schemaname

    WHERE v.schemaname = $1

    ORDER BY v.viewname
  `;
}
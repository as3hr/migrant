import { pool } from "../index.ts";

export async function getSchemaFingerprint(dbId: string): Promise<string> {
  const result = await pool.query(dbId, getSchemaFingerprintQuery());

  return result.rows[0]?.fingerprint ?? '';
}

export function getSchemaFingerprintQuery() {
  return `
    WITH
    excluded_schemas AS (
      SELECT unnest(ARRAY['pg_catalog', 'information_schema', 'pg_toast', 'auth', 'storage']) AS schema_name
    ),
    tables_info AS (
      SELECT
        n.nspname AS schema,
        c.relname AS table_name,
        c.oid
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN (SELECT schema_name FROM excluded_schemas)
    ),
    columns_info AS (
      SELECT
        t.schema,
        t.table_name,
        a.attname AS column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
        a.attnotnull AS not_null,
        a.attnum AS position,
        pg_get_expr(d.adbin, d.adrelid) AS default_value
      FROM pg_attribute a
      JOIN tables_info t ON t.oid = a.attrelid
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attnum > 0
        AND NOT a.attisdropped
    ),
    constraints_info AS (
      SELECT
        t.schema,
        t.table_name,
        con.conname AS constraint_name,
        con.contype AS constraint_type,
        pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con
      JOIN tables_info t ON t.oid = con.conrelid
    ),
    indexes_info AS (
      SELECT
        t.schema,
        t.table_name,
        i.relname AS index_name,
        pg_get_indexdef(ix.indexrelid) AS definition
      FROM pg_index ix
      JOIN tables_info t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      WHERE NOT ix.indisprimary
    ),
    views_info AS (
      SELECT
        n.nspname AS schema,
        c.relname AS view_name,
        pg_get_viewdef(c.oid) AS definition
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'v'
        AND n.nspname NOT IN (SELECT schema_name FROM excluded_schemas)
    ),
    enums_info AS (
      SELECT
        n.nspname AS schema,
        t.typname AS enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE n.nspname NOT IN (SELECT schema_name FROM excluded_schemas)
      GROUP BY n.nspname, t.typname
    ),
    combined AS (
      SELECT '1_table' AS kind, schema, table_name AS name, NULL AS detail FROM tables_info
      UNION ALL
      SELECT '2_column', schema, table_name || '.' || column_name,
             data_type || ':' || not_null::text || ':' || position::text || ':' || coalesce(default_value, '')
      FROM columns_info
      UNION ALL
      SELECT '3_constraint', schema, table_name || '.' || constraint_name,
             constraint_type::text || ':' || definition
      FROM constraints_info
      UNION ALL
      SELECT '4_index', schema, table_name || '.' || index_name, definition FROM indexes_info
      UNION ALL
      SELECT '5_view', schema, view_name, definition FROM views_info
      UNION ALL
      SELECT '6_enum', schema, enum_name, array_to_string(values, ',') FROM enums_info
    )
    SELECT md5(string_agg(kind || ':' || schema || ':' || name || ':' || coalesce(detail, ''), '|' ORDER BY kind, schema, name)) AS fingerprint
    FROM combined;`;
}

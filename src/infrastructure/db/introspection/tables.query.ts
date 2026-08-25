import type { Table } from "../../domain/index.ts";
import { pool } from "../index.ts";

export async function getTables(schema: string, dbId: string): Promise<Record<string, Table>> {
  const columnsResult = await pool.query(
    dbId,
    getColumnsQuery(),
    [schema]
  );
  const fkResult = await pool.query(
    dbId,
    getFksQuery(),
    [schema]
  );
  const indexResult = await pool.query(
    dbId,
    getIdxsQuery(),
    [schema]
  );
  const pksResult = await pool.query(
    dbId,
    getPrimaryKeysQuery(),
    [schema]
  );
  const uniqueConstraintsResult = await pool.query(
    dbId,
    getUniqueConstraintsQuery(),
    [schema]
  );
  const checkConstraintsResult = await pool.query(
    dbId,
    getCheckConstraintsQuery(),
    [schema]
  );

  const tables: Record<string, Table> = {}

  for (const row of columnsResult.rows) {
    const key = `${schema}.${row.table_name}`;
    if (!tables[key]) {
      tables[key] = {
        schemaName: schema,
        name: row.table_name,
        columns: [],
        foreignKeys: [],
        indexes: [],
        checkConstraints: [],
        uniqueConstraints: [],
        primaryKey: null,
      }
    }
    tables[key].columns.push({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      default: row.column_default,
      position: row.ordinal_position,
    });
  }

  for (const row of fkResult.rows) {
    const key = `${schema}.${row.table_name}`;
    if (tables[key]) {
      tables[key].foreignKeys.push({
        name: row.foreign_key_name,
        columns: row.columns,
        referencesTable: row.references_table,
        referencesColumns: row.references_columns,
        onDelete: row.delete_rule,
        onUpdate: row.update_rule,
      });
    }
  }

  for (const row of indexResult.rows) {
    const key = `${schema}.${row.table_name}`;
    if (tables[key]) {
      tables[key].indexes.push({
        name: row.index_name,
        columns: row.columns,
        unique: row.is_unique,
        method: row.method,
        definition: row.definition,
      });
    }
  }

  for (const row of pksResult.rows) {
    const key = `${schema}.${row.table_name}`;
    if (tables[key]) {
      tables[key].primaryKey = {
        name: row.constraint_name,
        columns: row.columns,
      };
    }
  }

  for (const row of checkConstraintsResult.rows) {
    const key = `${schema}.${row.table_name}`;
    if (tables[key]) {
      tables[key].checkConstraints.push({
        name: row.constraint_name,
        expression: row.expression,
      });
    }
  }

  for (const row of uniqueConstraintsResult.rows) {
    const key = `${schema}.${row.table_name}`;
    if (tables[key]) {
      tables[key].uniqueConstraints.push({
        name: row.constraint_name,
        columns: row.columns,
      });
    }
  }

  return tables;
}

export function getColumnsQuery(): string {
  return `
    SELECT 
      c.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      c.ordinal_position
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema
      AND t.table_name = c.table_name
    WHERE c.table_schema = $1
      AND t.table_type = 'BASE TABLE'
    ORDER BY
      c.table_name,
      c.ordinal_position
  `;
}

export function getFksQuery(): string {
  return `
    SELECT
      kcu.constraint_name AS foreign_key_name,
      kcu.table_name,

      json_agg(
        kcu.column_name
        ORDER BY kcu.ordinal_position
      ) AS columns,

      ccu.table_name AS references_table,

      json_agg(
        ccu.column_name
        ORDER BY kcu.ordinal_position
      ) AS references_columns,

      rc.delete_rule,
      rc.update_rule

    FROM information_schema.key_column_usage kcu

    JOIN information_schema.referential_constraints rc
      ON kcu.constraint_name = rc.constraint_name
      AND kcu.constraint_schema = rc.constraint_schema

    JOIN information_schema.constraint_column_usage ccu
      ON rc.unique_constraint_name = ccu.constraint_name
      AND rc.unique_constraint_schema = ccu.constraint_schema

    WHERE kcu.table_schema = $1

    GROUP BY
      kcu.constraint_name,
      kcu.table_name,
      ccu.table_name,
      rc.delete_rule,
      rc.update_rule
  `;
}

export function getIdxsQuery(): string {
  return `
    SELECT
      t.relname AS table_name,
      i.relname AS index_name,
      ix.indisunique AS is_unique,
      am.amname AS method,
      pg_get_indexdef(ix.indexrelid) AS definition,
      json_agg(a.attname ORDER BY k.n) AS columns
    FROM pg_class t
    JOIN pg_index ix
      ON t.oid = ix.indrelid
    JOIN pg_class i
      ON i.oid = ix.indexrelid
    JOIN pg_namespace n
      ON t.relnamespace = n.oid
    JOIN pg_am am
      ON i.relam = am.oid
    JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, n)
      ON true
    JOIN pg_attribute a
      ON a.attrelid = t.oid
      AND a.attnum = k.attnum
    WHERE n.nspname = $1
      AND t.relkind = 'r'
    GROUP BY
      t.relname,
      i.relname,
      ix.indisunique,
      am.amname,
      ix.indexrelid
  `;
}

export function getPrimaryKeysQuery(): string {
  return `
    SELECT
      c.conname AS constraint_name,
      cls.relname AS table_name,
      json_agg(
        att.attname
        ORDER BY array_position(c.conkey, att.attnum)
      ) AS columns
    FROM pg_constraint c
    JOIN pg_class cls
      ON cls.oid = c.conrelid
    JOIN pg_namespace n
      ON n.oid = cls.relnamespace
    JOIN pg_attribute att
      ON att.attrelid = cls.oid
      AND att.attnum = ANY(c.conkey)
    WHERE c.contype = 'p'
      AND n.nspname = $1
    GROUP BY
      c.conname,
      cls.relname
  `;
}

export function getUniqueConstraintsQuery(): string {
  return `
    SELECT
      c.conname AS constraint_name,
      cls.relname AS table_name,
      json_agg(
        att.attname
        ORDER BY array_position(c.conkey, att.attnum)
      ) AS columns
    FROM pg_constraint c
    JOIN pg_class cls
      ON cls.oid = c.conrelid
    JOIN pg_namespace n
      ON n.oid = cls.relnamespace
    JOIN pg_attribute att
      ON att.attrelid = cls.oid
      AND att.attnum = ANY(c.conkey)
    WHERE c.contype = 'u'
      AND n.nspname = $1
    GROUP BY
      c.conname,
      cls.relname
  `;
}

export function getCheckConstraintsQuery(): string {
  return `
    SELECT
      c.conname AS constraint_name,
      cls.relname AS table_name,
      pg_get_constraintdef(c.oid) AS expression
    FROM pg_constraint c
    JOIN pg_class cls
      ON cls.oid = c.conrelid
    JOIN pg_namespace n
      ON n.oid = cls.relnamespace
    WHERE c.contype = 'c'
      AND n.nspname = $1
  `;
}
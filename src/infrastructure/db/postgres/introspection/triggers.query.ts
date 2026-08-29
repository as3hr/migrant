import type { Trigger } from "../../../../domain/index.ts";
import { pool } from "../pool.ts";


export async function getTriggers(schema: string, dbId: string): Promise<Trigger[]> {
  const result = await pool.query(dbId, getTriggersQuery(), [schema]);

  return result.rows.map((row: any) => ({
    schemaName: schema,
    name: row.trigger_name,
    table: row.table_name,
    events: row.events ?? [],
    timing: row.action_timing,
    functionName: row.function_name,
    definition: row.definition,
  }));
}

export function getTriggersQuery(): string {
  return `
    SELECT
      t.tgname AS trigger_name,
      c.relname AS table_name,

      json_agg(
        DISTINCT e.event_manipulation
        ORDER BY e.event_manipulation
      ) AS events,

      e.action_timing,

      p.proname AS function_name,

      pg_get_triggerdef(t.oid) AS definition

    FROM pg_trigger t

    JOIN pg_class c
      ON c.oid = t.tgrelid

    JOIN pg_namespace n
      ON n.oid = c.relnamespace

    JOIN pg_proc p
      ON p.oid = t.tgfoid

    JOIN information_schema.triggers e
      ON e.trigger_name = t.tgname
      AND e.event_object_table = c.relname
      AND e.trigger_schema = n.nspname

    WHERE n.nspname = $1
      AND NOT t.tgisinternal

    GROUP BY
      t.oid,
      t.tgname,
      c.relname,
      e.action_timing,
      p.proname

    ORDER BY t.tgname
  `;
}
import type { Extension } from "../../../../domain/index.ts";
import { pool } from "../pool.ts";

export async function getExtensions(dbId: string): Promise<Extension[]> {
  const result = await pool.query(dbId, getExtensionsQuery());

  return result.rows.map((row: any) => ({
    name: row.name,
    version: row.version,
  }));
}

export function getExtensionsQuery(): string {
  return `
    SELECT
      extname AS name,
      extversion AS version
    FROM pg_extension
    ORDER BY extname
  `;
}
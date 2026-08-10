import { pool, type Extension } from "@src/exports.ts";

export async function getExtensions(): Promise<Extension[]> {
  const result = await pool.query(_getExtensions());

  return result.rows.map((row) => ({
    name: row.name,
    version: row.version,
  }));
}

function _getExtensions(): string {
  return `
    SELECT
      extname AS name,
      extversion AS version
    FROM pg_extension
    ORDER BY extname
  `;
}
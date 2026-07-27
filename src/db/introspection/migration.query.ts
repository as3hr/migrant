import { pool, type Migration } from "@src/exports.ts";

export async function getMigrations(): Promise<Migration[]> {
    const result = await pool.query(`
      SELECT
        version,
        name
      FROM supabase_migrations.schema_migrations
      ORDER BY version ASC
    `);
  
    return result.rows.map((row) => ({
      id: row.version,
      name: row.name,
      appliedAt: null,
      source: "supabase",
    }));
  }
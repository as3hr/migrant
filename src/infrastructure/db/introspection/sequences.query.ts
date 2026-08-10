import { pool, type Sequence } from "@src/exports.ts";

export async function getSequences(schema: string): Promise<Sequence[]> {
  const result = await pool.query(_getSequences(), [schema]);

  return result.rows.map((row) => ({
    schemaName: schema,
    name: row.sequence_name,
    dataType: row.data_type,
    startValue: Number(row.start_value),
    increment: Number(row.increment),
    minValue: Number(row.minimum_value),
    maxValue: Number(row.maximum_value),
    cycle: row.cycle_option === 'YES',
  }));
}

function _getSequences(): string {
  return `
    SELECT
      sequence_name,
      data_type,
      start_value,
      increment,
      minimum_value,
      maximum_value,
      cycle_option

    FROM information_schema.sequences

    WHERE sequence_schema = $1

    ORDER BY sequence_name
  `;
}
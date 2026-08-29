import type { Table } from "../domain/index.ts";

export function getTableContent(table: Table, relatedTables: string[]): string {
  const columns = table.columns;
  const content = `
      Database Table
      
      Schema: ${table.schemaName}
      Table: ${table.name}
      
      Columns:
      ${columns.map((column: any) => `
      - ${column.name}
        Type: ${column.type}
        Nullable: ${column.nullable}
        Default: ${column.default ?? 'none'}
      `).join('')}
      Related Tables: ${relatedTables}
  `;
  
  return content;
}
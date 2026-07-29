import type { Table } from "@src/exports.ts";

export function getTableContent(table: Table): string {
    const columns = table.columns;
    const primaryKey = table.primaryKey;
    const foreignKeys = table.foreignKeys;
    const checkConstraints = table.checkConstraints;
    const uniqeuConstraints = table.uniqueConstraints;
    const indexes = table.indexes;

    const content = `
        Database Table
        
        Schema: ${table.schemaName}
        Table: ${table.name}
        
        Columns:
        ${columns.map(column => `
        - ${column.name}
          Type: ${column.type}
          Nullable: ${column.nullable}
          Default: ${column.default ?? 'none'}
        `).join('')}
        
        Primary Key:
        ${primaryKey
            ? `${primaryKey.name} (${primaryKey.columns.length > 0  ? primaryKey.columns.join(', '): []}`
            : 'None'}
        
        Foreign Keys:
        ${foreignKeys.length
            ? foreignKeys.map(fk => `
        - ${fk.name}
          Columns: ${fk.columns.join(', ')}
          References: ${fk.referencesTable}(${fk.referencesColumns?.join(', ')})
          On Delete: ${fk.onDelete}
          On Update: ${fk.onUpdate}
        `).join('')
            : 'None'}
            
        Unique Constraints:
        ${uniqeuConstraints.length
            ? uniqeuConstraints.map(c =>
                `- ${c.name}: (${c.columns.join(', ')})`
              ).join('\n')
            : 'None'}
            
        Check Constraints:
        ${checkConstraints.length
            ? checkConstraints.map(c =>
                `- ${c.name}: ${c.expression}`
              ).join('\n')
            : 'None'}
            
        Indexes:
        ${indexes.length
            ? indexes.map(index => `
        - ${index.name}
          Columns: ${index.columns.join(', ')}
          Unique: ${index.unique}
          Method: ${index.method}
          Definition: ${index.definition}
        `).join('')
            : 'None'}
    `;
    
    return content;
}
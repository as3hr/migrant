import { pool } from "../config/index.ts"

export interface Column {
  name: string
  type: string
  nullable: boolean
  default: string | null
}

export interface ForeignKey {
  column: string
  referencesTable: string
  referencesColumn: string
  onDelete: string
}

export interface Index {
  name: string
  columns: string[]
  unique: boolean
}

export interface Table {
  name: string
  columns: Column[]
  foreignKeys: ForeignKey[]
  indexes: Index[]
  rowCount: number
}

export interface View {
  name: string
  definition: string
  referencedTables: string[]
}

export interface Trigger {
  name: string
  table: string
  event: string
  timing: string
  functionName: string
}

export interface SchemaGraph {
  tables: Record<string, Table>
  views: Record<string, View>
  triggers: Trigger[]
  generatedAt: string
}

async function fetchTables(): Promise<Record<string, Table>> {
    const columnsResult = await pool.query(`
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position
    `)
  
    const fkResult = await pool.query(`
      SELECT
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS references_table,
        ccu.column_name AS references_column,
        rc.delete_rule
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.referential_constraints rc
        ON kcu.constraint_name = rc.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON rc.unique_constraint_name = ccu.constraint_name
      WHERE kcu.table_schema = 'public'
    `)
  
    const indexResult = await pool.query(`
      SELECT
        t.relname AS table_name,
        i.relname AS index_name,
        ix.indisunique AS is_unique,
        array_agg(a.attname ORDER BY k.n) AS columns
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, n) ON true
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
      WHERE n.nspname = 'public' AND t.relkind = 'r'
      GROUP BY t.relname, i.relname, ix.indisunique
    `)
  
    const rowCountResult = await pool.query(`
      SELECT 
        relname AS table_name,
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
    `)
  
    const tables: Record<string, Table> = {}
  
    for (const row of columnsResult.rows) {
      if (!tables[row.table_name]) {
        tables[row.table_name] = {
          name: row.table_name,
          columns: [],
          foreignKeys: [],
          indexes: [],
          rowCount: 0,
        }
      }
      tables[row.table_name]!.columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default,
      })
    }
  
    for (const row of fkResult.rows) {
      if (tables[row.table_name]) {
        tables[row.table_name]!.foreignKeys.push({
          column: row.column_name,
          referencesTable: row.references_table,
          referencesColumn: row.references_column,
          onDelete: row.delete_rule,
        })
      }
    }
  
    for (const row of indexResult.rows) {
      if (tables[row.table_name]) {
        tables[row.table_name]!.indexes.push({
          name: row.index_name,
          columns: row.columns,
          unique: row.is_unique,
        })
      }
    }
  
    for (const row of rowCountResult.rows) {
      if (tables[row.table_name]) {
        tables[row.table_name]!.rowCount = parseInt(row.row_count)
      }
    }
  
    return tables
}
  
async function fetchViews(): Promise<Record<string, View>> {
    const result = await pool.query(`
      SELECT 
        viewname,
        definition
      FROM pg_views
      WHERE schemaname = 'public'
    `)
  
    const views: Record<string, View> = {}
  
    for (const row of result.rows) {
      const referencedTables = extractTableReferences(row.definition)
      views[row.viewname] = {
        name: row.viewname,
        definition: row.definition,
        referencedTables,
      }
    }
  
    return views
}
  
async function fetchTriggers(): Promise<Trigger[]> {
    const result = await pool.query(`
      SELECT
        trigger_name,
        event_object_table AS table_name,
        event_manipulation AS event,
        action_timing AS timing,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `)
  
    return result.rows.map((row: any) => ({
      name: row.trigger_name,
      table: row.table_name,
      event: row.event,
      timing: row.timing,
      functionName: extractFunctionName(row.action_statement),
    }))
}
  
function extractTableReferences(viewDefinition: string): string[] {
    const matches = viewDefinition.match(/FROM\s+(\w+)|JOIN\s+(\w+)/gi) || []
    return [...new Set(
      matches.map(m => m.replace(/FROM\s+|JOIN\s+/i, '').trim().toLowerCase())
    )]
}
  
function extractFunctionName(actionStatement: string): string {
    const match = actionStatement.match(/EXECUTE FUNCTION\s+(\w+)/i)
    return match ? match[1]! : actionStatement
}

export async function parseSchema(): Promise<SchemaGraph | undefined> {
  
    try {
      const [tables, views, triggers] = await Promise.all([
        fetchTables(),
        fetchViews(),
        fetchTriggers(),
      ])
        const result = {
            tables,
            views,
            triggers,
            generatedAt: new Date().toISOString(),
        };
        console.log('Result', result);
        return result;
    } catch (e) {
        console.log('Error in schema parser', e);
    }
  }
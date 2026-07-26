import { pool } from "../config/db.config.ts";
import type { SchemaGraph } from "./db_interfaces.ts";

export async function startScan(): Promise<SchemaGraph[] | undefined> {
    try {
      const schemas = await getSchemas();
      console.log('Schemas fetched successfully!', schemas);
  
      const schemaGraphs: SchemaGraph[] = [];
  
      for (const schema of schemas) {
        const graph = await parseSchema(schema);
  
        if (graph) {
          schemaGraphs.push(graph);
        }
      }
  
          return schemaGraphs;
    } catch (error) {
      console.error("Error scanning database:", error);
      return undefined;
    }
  }

async function getSchemas(): Promise<string[]> {
    const result = await pool.query(`
        SELECT nspname AS schema_name
        FROM pg_namespace
        WHERE nspname NOT LIKE 'pg_%'
          AND nspname <> 'information_schema'
        ORDER BY nspname;
    `);
    
    return result.rows.map(row => row.schema_name as string);
}

async function parseSchema(schema: string): Promise<SchemaGraph | undefined> {
  
    try {
        const [tables, views, triggers, functions, enums, sequence, extensions ] = await Promise.all([
            getTables(schema),
            getViews(schema),
            getTriggers(schema),
            getFunctions(schema),
            getEnums(schema),
            getSequences(schema),
            getExtensions(schema),
      ])
        const result = {
            generatedAt: new Date().toISOString(),
        };
        console.log('Result', result);
        return undefined;
    } catch (e) {
        console.log('Error in schema parser', e);
    }
}
  

async function getTables(schema: string) {}
async function getViews(schema: string) {}
async function getTriggers(schema: string) {}
async function getFunctions(schema: string) {}
async function getEnums(schema: string) {}
async function getSequences(schema: string) {}
async function getExtensions(schema: string) {}
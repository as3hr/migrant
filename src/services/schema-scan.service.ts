import { getMigrations } from "@src/db/introspection/migration.query.ts";
import {
  getEnums,
  getExtensions,
  getFunctions,
  getSchemas,
  getSequences,
  getTables,
  getTriggers,
  getViews,
  type DatabaseGraph,
  type SchemaGraph
} from "@src/exports.ts";
import fs from "fs";

export async function startScan(): Promise<DatabaseGraph | undefined> {
  try {
    const schemaGraphs: SchemaGraph[] = [];
    const schemas = await getSchemas();
    
    for (const schema of schemas) {
      const graph = await parseSchema(schema);
      
      if (graph) {
        schemaGraphs.push(graph);
      }
    }

    const extensions = await getExtensions();
    const migrations = await getMigrations();

    const result: DatabaseGraph = {
      schemas: schemaGraphs,
      extensions,
      migrations,
      generatedAt: new Date().toISOString(),
    }

    const data = new Uint8Array(Buffer.from(JSON.stringify(result)));
    fs.writeFile('logs/scanned_db.json', data, (err) => {
      if (err) throw err;
      console.log('DB Schema file has been saved!');
    });

    return result;
  } catch (error) {
    console.error("Error scanning database:", error);
    return undefined;
  }
}

async function parseSchema(schema: string): Promise<SchemaGraph | undefined> {
  try {
    const [tables, views, triggers, functions, enums, sequences] = await Promise.all([
      getTables(schema),
      getViews(schema),
      getTriggers(schema),
      getFunctions(schema),
      getEnums(schema),
      getSequences(schema)
    ]);

    const result = {
        schema,
        tables,
        views,
        triggers,
        functions,
        enums,
        sequences,
        generatedAt: new Date().toISOString(),
    };
    console.log(`${schema} Schema Scanned Successfully!`);
    return result;
  } catch (e) {
      console.log('Error in schema parser', e);
  }
}
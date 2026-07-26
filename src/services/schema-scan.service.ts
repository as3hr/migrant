import {
  getEnums,
  getExtensions,
  getFunctions,
  getSchemas,
  getSequences,
  getTables,
  getTriggers,
  getViews,
  type SchemaGraph
} from "@src/exports.ts";
import fs from "fs";

export async function startScan(): Promise<SchemaGraph[] | undefined> {
  try {
    const schemas = await getSchemas();
    const schemaGraphs: SchemaGraph[] = [];

    for (const schema of schemas) {
      const graph = await parseSchema(schema);

      if (graph) {
        schemaGraphs.push(graph);
      }
    }

    const data = new Uint8Array(Buffer.from(JSON.stringify(schemaGraphs)));
    fs.writeFile('logs/scanned_db.json', data, (err) => {
      if (err) throw err;
      console.log('DB Schema file has been saved!');
    });

    return schemaGraphs;
  } catch (error) {
    console.error("Error scanning database:", error);
    return undefined;
  }
}

async function parseSchema(schema: string): Promise<SchemaGraph | undefined> {
  try {
    const [tables, views, triggers, functions, enums, sequences, extensions] = await Promise.all([
      getTables(schema),
      getViews(schema),
      getTriggers(schema),
      getFunctions(schema),
      getEnums(schema),
      getSequences(schema),
      getExtensions(schema),
    ]);

    const result = {
        schema,
        tables,
        views,
        triggers,
        functions,
        enums,
        sequences,
        extensions,
        generatedAt: new Date().toISOString(),
    };
    console.log(`${schema} Schema Scanned Successfully!`);
    return result;
  } catch (e) {
      console.log('Error in schema parser', e);
  }
}
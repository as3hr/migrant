import { getMigrations } from "@src/db/introspection/migration.query.ts";
import {
  databaseToKnowledgeDocuments,
  getEnums,
  getExtensions,
  getFunctions,
  getSchemas,
  getSequences,
  getTables,
  getTriggers,
  getViews,
  type DatabaseGraph,
  type KnowledgeDocument,
  type SchemaGraph
} from "@src/exports.ts";
import fs from 'fs';

export async function startScan(): Promise<void> {
  try {
    const startedAt = Date.now();

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

    const dbKnowledgeDocuments = databaseToKnowledgeDocuments(result);
    await writeDataToFile(dbKnowledgeDocuments);

    const diff: number = (Date.now() - startedAt) / 1000;
    console.log(`Completed db scan in ${diff} seconds`);

  } catch (error) {
    console.error("Error scanning database:", error);
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
    
    return result;
  } catch (e) {
      console.log('Error in schema parser', e);
  }
}

async function writeDataToFile(result: KnowledgeDocument[]): Promise<void> {
  fs.writeFile(
    "logs/db_scanned.json",
    JSON.stringify(result, null, 2),
    (_) => {}
  );
}
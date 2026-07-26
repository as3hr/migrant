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

async function parseSchema(schema: string): Promise<SchemaGraph | undefined> {
  
    try {
        const [tables, views, triggers, functions, enums, sequences, extensions ] = await Promise.all([
            getTables(schema),
            getViews(schema),
            getTriggers(schema),
            getFunctions(schema),
            getEnums(schema),
            getSequences(schema),
            getExtensions(schema),
      ])
      const result = {
          tables,
          views,
          triggers,
          functions,
          enums,
          sequences,
          extensions,
          generatedAt: new Date().toISOString(),
        };
        console.log('Result', result);
        return result;
    } catch (e) {
        console.log('Error in schema parser', e);
    }
}
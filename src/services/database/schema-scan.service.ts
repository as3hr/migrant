import {
  appContext,
  databaseToKnowledgeDocuments,
  getEnums,
  getExtensions,
  getFunctions,
  getMigrations,
  getSchemas,
  getSequences,
  getTables,
  getTriggers,
  getViews,
  pool,
  type CommandContext,
  type DatabaseGraph,
  type KnowledgeDocument,
  type SchemaGraph
} from "@src/exports.ts";

export async function startScan(ctx: CommandContext): Promise<void> {
  try {
    const startedAt = Date.now();
    
    const schemaGraphs: SchemaGraph[] = [];
    const schemas = await getSchemas();
    ctx.success(`${schemas.length} Schemas Scanned Successfully!`);
    
    setTimeout(() => {
      ctx.busy(`Scanning your database in more depth...`);
    }, 2000);

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
    await createEmbeddingsInTheDb(dbKnowledgeDocuments);

    const diff: number = (Date.now() - startedAt) / 1000;
    ctx.success(`Completed db scan in ${diff} seconds`);
    appContext.workspace.setLastScanTimeOfDb(pool.dbId ?? '');
    
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


async function createEmbeddingsInTheDb(documents: KnowledgeDocument[]) {
  try { 
    const embeddings = await appContext.services.embeddingService.createEmbeddings(
      documents.map(d => d.content)
    );
    if (embeddings.length > 0) {
      await appContext.services.databaseService.createEmbeddingsInDatabase(
        embeddings,
        documents!
      )
    }
  }  catch (error) { 
    console.log('Error in creating embeddings');
  }
}
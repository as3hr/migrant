import {
  appContext,
  databaseToKnowledgeDocuments,
  getEnums,
  getExtensions,
  getFunctions,
  getSchemaFingerprint,
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
  const dbId = pool.dbId;
  if (!dbId) {
    ctx.error("No active database connection — cannot scan.");
    return;
  }

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

    const result: DatabaseGraph = {
      schemas: schemaGraphs,
      extensions,
      generatedAt: new Date().toISOString(),
    };

    const dbKnowledgeDocuments = databaseToKnowledgeDocuments(result);
    const success = await reindexDocuments(dbKnowledgeDocuments);

    if (!success) {
      ctx.error("Failed to reindex documents — scan results were not persisted.");
      return;
    }

    const schemaFingerprint = await getSchemaFingerprint();
    const diff: number = (Date.now() - startedAt) / 1000;
    ctx.success(`Completed db scan in ${diff} seconds`);

    // Single call — updates WorkSpace memory, SQLite, and Supabase together.
    await appContext.services.registryService.updateDatabase(
      dbId,
      {
        schemaFingerprint,
        indexStatus: "ready",
        lastScannedAt: new Date(),
      },
      {
        schema_fingerprint: schemaFingerprint,
      }
    );
  } catch (error) {
    console.error("Error scanning database:", error);
    await appContext.services.registryService.updateDatabase(dbId, {
      indexStatus: "failed",
    });
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

    return {
      schema,
      tables,
      views,
      triggers,
      functions,
      enums,
      sequences,
      generatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.log("Error in schema parser", e);
  }
}

async function reindexDocuments(documents: KnowledgeDocument[]): Promise<boolean> {
  try { 
    const embeddings = await appContext.services.embeddingService.createEmbeddings(
      documents.map(d => d.content)
    );
    if (embeddings.length > 0) {
      return await appContext.services.databaseService.reindexDocuments(embeddings, documents);
    }
    return true;
  } catch (error) { 
    console.error("Error creating embeddings:", error);
    return false;
  }
}
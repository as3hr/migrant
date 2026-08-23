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
  type CommandContext,
  type DatabaseGraph,
  type KnowledgeDocument,
  type SchemaGraph
} from "@src/exports.ts";

export async function startScan(ctx: CommandContext, dbId: string): Promise<void> {
  try {
    const startedAt = Date.now();
    
    const schemaGraphs: SchemaGraph[] = [];
    const schemas = await getSchemas(dbId);
    ctx.success(`${schemas.length} Schemas Scanned Successfully!`);
    
    setTimeout(() => {
      ctx.busy(`Scanning your database in more depth...`);
    }, 2000);

    const graphs = await Promise.all(schemas.map((s) => parseSchema(s, dbId)));
    const validGraphs = graphs.filter((g): g is NonNullable<typeof g> => Boolean(g));
    schemaGraphs.push(...validGraphs);

    const extensions = await getExtensions(dbId);

    const result: DatabaseGraph = {
      schemas: validGraphs,
      extensions,
      generatedAt: new Date().toISOString(),
    };

    const dbKnowledgeDocuments = databaseToKnowledgeDocuments(result);

    const success = await reindexDocuments(dbId, dbKnowledgeDocuments);

    if (!success) {
      ctx.error("Failed to reindex documents — scan results were not persisted.");
      return;
    }

    const schemaFingerprint = await getSchemaFingerprint(dbId);

    const diff: number = (Date.now() - startedAt) / 1000;
    ctx.success(`Completed db scan in ${diff} seconds`);

    await appContext.services.databaseRegistryService.updateDatabase(
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
    await appContext.services.databaseRegistryService.updateDatabase(dbId, {
      indexStatus: "failed",
    });
  }
}

async function parseSchema(schema: string, dbId: string): Promise<SchemaGraph | undefined> {
  try {
    const [tables, views, triggers, functions, enums, sequences] = await Promise.all([
      getTables(schema, dbId),
      getViews(schema, dbId),
      getTriggers(schema, dbId),
      getFunctions(schema, dbId),
      getEnums(schema, dbId),
      getSequences(schema, dbId)
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

async function reindexDocuments(dbId: string, documents: KnowledgeDocument[]): Promise<boolean> {
  try { 
    const embeddings = await appContext.services.embeddingService.createEmbeddings(
      documents.map(d => d.content)
    );

    if (embeddings.length > 0) {
      const res = await appContext.services.databaseService.reindexDocuments(dbId, embeddings, documents);
      return res;
    }
    return true;
  } catch (error) { 
    console.error("Error creating embeddings:", error);
    return false;
  }
}
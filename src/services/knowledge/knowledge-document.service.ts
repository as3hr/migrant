import { getTableContent, type DatabaseGraph, type KnowledgeDocument } from "@src/exports.ts";

export function databaseToKnowledgeDocuments(dbGraph: DatabaseGraph) {
    const schemas = dbGraph.schemas;
    const extensions = dbGraph.extensions;
    let knowledgeDocs: KnowledgeDocument[] = [];

    for (const schema of schemas) {
        const sequences = schema.sequences;
        const enums = schema.enums;
        const triggers = schema.triggers;
        const functions = schema.functions;
        const views = schema.views;
        const tables = schema.tables;
        
        /// Tables
        for (const [tableKey, table] of Object.entries(tables)) {
            const foreignKeys = table.foreignKeys;
            const relatedTables = foreignKeys.map(fk => `${table.schemaName}.${fk.referencesTable}`);
            const content = getTableContent(table, relatedTables);
            const primaryKey = table.primaryKey;
            const checkConstraints = table.checkConstraints;
            const uniquEConstraints = table.uniqueConstraints;
            const indexes = table.indexes;
            
            const metaData = {
                primaryKey,
                relatedTables,
                foreignKeys,
                indexes,
                checkConstraints,
                uniquEConstraints
            };
            
            // columns
            knowledgeDocs.push({
                id: `Table Key: ${tableKey}`,
                name: table.name,
                schema: table.schemaName,
                content: content,
                type: 'table',
                metadata: metaData
            });
        }

        /// Views
        for (const [viewKey, viewValue] of Object.entries(views)) {
            knowledgeDocs.push({
                id: `View Key: ${viewKey}`,
                name: viewValue.name,
                schema: viewValue.schemaName,
                content: `
                    SchemaName: ${viewValue.schemaName}, Name: ${viewValue.name},
                    Defination: ${viewValue.definition}
                `,
                type: 'view',
                metadata: {
                    relatedTables: viewValue.referencedTables,
                }
            });
        }

        /// Functions
        for (const functionItem of functions) {
            const functionItemContent = `
                SchemaName: ${functionItem.schemaName}, Name: ${functionItem.name},
                Arguments: ${functionItem.arguments}, Language: ${functionItem.language},
                Body: ${functionItem.body}, Return Type: ${functionItem.returnType}
            `;
            knowledgeDocs.push({
                id: `Function: ${functionItem.schemaName}:${functionItem.name}`,
                name: functionItem.name,
                schema: functionItem.schemaName,
                content: functionItemContent,
                type: 'function',
                metadata: {
                    relatedTables: [],
                },
            });
        }

        /// Enums
        for (const enumItem of enums) {
            const enumItemContent = `
                SchemaName: ${enumItem.schemaName}, Name: ${enumItem.name},
                Values: ${enumItem.values}
            `;
            knowledgeDocs.push({
                id: `Enum: ${enumItem.schemaName}:${enumItem.name}`,
                name: enumItem.name,
                schema: enumItem.schemaName,
                content: enumItemContent,
                type: 'enum',
                metadata: {
                    relatedTables: [],
                },
            });
        }

        /// Triggers
        for (const trigger of triggers) {
            const triggerContent = `
                Schema: ${trigger.schemaName}, Name: ${trigger.name}, Function Name: ${trigger.functionName},
                TableName: ${trigger.table}, Timing: ${trigger.timing}, Events: ${trigger.events}
            `;
            knowledgeDocs.push({
                id: `Trigger: ${trigger.schemaName}:${trigger.name}`,
                name: trigger.name,
                schema: trigger.schemaName,
                content: triggerContent,
                type: 'trigger',
                metadata: {
                    relatedTables: [],
                },
            });
        }    

        /// Sequences
        for (const sequence of sequences) {
            const sequenceContent = `
                SchemaName: ${sequence.schemaName}, Name: ${sequence.name}, Cycle: ${sequence.cycle}, 
                DataType: ${sequence.dataType}, MaxValue: ${sequence.maxValue}, MinValue: ${sequence.minValue}, 
                IncrementValue: ${sequence.increment}, StartValue: ${sequence.startValue}, 
            `;
            knowledgeDocs.push({
                id: `Sequence: ${sequence.schemaName}:${sequence.name}:${sequence.dataType}`,
                name: sequence.name,
                schema: sequence.schemaName,
                content: sequenceContent,
                type: 'sequence',
                metadata: {
                    relatedTables: [],
                },
            });
        }
    }

    for (const extension of extensions) {
        knowledgeDocs.push({
            id: `Extension: ${extension.name}:${extension.version}`,
            name: extension.name,
            schema: 'N/A',
            content: `Name: ${extension.name}, Version: ${extension.version}`,
            type: 'extension',
            metadata: {
                relatedTables: [],
            },
        });
    }

    return knowledgeDocs;
} 
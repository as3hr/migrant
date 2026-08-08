export type KnowledgeDocumentType =
    | 'table'
    | 'view'
    | 'function'
    | 'enum'
    | 'trigger'
    | 'sequence'
    | 'extension'
    | 'migration';

export interface KnowledgeDocument {
  id: string;
  type: KnowledgeDocumentType;
  schema: string;
  name: string;
  content: string;
  metadata: Record<string, any>;
}
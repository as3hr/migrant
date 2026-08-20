import type { Database } from './database.types.ts'

// Extracts the row type for a specific table (e.g., 'Database')
export type DbDatabaseType = Database['public']['Tables']['Database']['Row']
export type InsertDatabaseType = Database['public']['Tables']['Database']['Insert']
export type UpdateDatabaseType = Database['public']['Tables']['Database']['Update']

// Extracts the row type for a specific table (e.g., 'documents')
export type DbKnowledgeDocumentType = Database['public']['Tables']['documents']['Row']
export type DbInsertKnowledgeDocumentType = Database['public']['Tables']['documents']['Insert']
export type DbUpdateKnowledgeDocumentType = Database['public']['Tables']['documents']['Update']

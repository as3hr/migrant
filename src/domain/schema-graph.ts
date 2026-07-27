// ==============================
// Columns & Constraints
// ==============================

  export interface Column {
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
    position: number;
  }
  
  export interface PrimaryKey {
    name: string;
    columns: string[];
  }
  
  export interface ForeignKey {
    name: string;
    columns: string[];
    referencesTable: string;
    referencesColumns: string[];
    onDelete: string;
    onUpdate: string;
  }
  
  export interface UniqueConstraint {
    name: string;
    columns: string[];
  }
  
  export interface CheckConstraint {
    name: string;
    expression: string;
  }
  
  
  // ==============================
  // Indexes
  // ==============================
  
  export interface Index {
    name: string;
    columns: string[];
    unique: boolean;
    method: string;
    definition: string;
  }
  
  
  // ==============================
  // Tables
  // ==============================
  
  export interface Table {
    schemaName: string;
    name: string;
    columns: Column[];
    primaryKey: PrimaryKey | null;
    foreignKeys: ForeignKey[];
    uniqueConstraints: UniqueConstraint[];
    checkConstraints: CheckConstraint[];
    indexes: Index[];
  }
  
  
  // ==============================
  // Views
  // ==============================
  
  export interface View {
    schemaName: string;
    name: string;
    definition: string;
    referencedTables: string[];
  }
  
  
  // ==============================
  // Functions & Triggers
  // ==============================
  
  export interface DatabaseFunction {
    schemaName: string;
    name: string;
    arguments: string[];
    returnType: string;
    language: string;
    body: string;
  }
  
  export interface Trigger {
    schemaName: string;
    name: string;
    table: string;
    events: string[];
    timing: string;
    functionName: string;
  }
  
  
  // ==============================
  // Types & Objects
  // ==============================
  
  export interface EnumType {
    schemaName: string;
    name: string;
    values: string[];
  }
  
  export interface Sequence {
    schemaName: string;
    name: string;
    dataType: string;
    startValue: number;
    increment: number;
    minValue: number;
    maxValue: number;
    cycle: boolean;
  }
  
  export interface Extension {
    name: string;
    version: string;
  }

  export interface Migration {
    id: string;
    name: string;
    appliedAt: string | null;
    source: "supabase";
  }
  
  
  // ==============================
  // Schema
  // ==============================
  
export interface SchemaGraph {
    schema: string;
    tables: Record<string, Table>;
    views: Record<string, View>;
    triggers: Trigger[];
    functions: DatabaseFunction[];
    enums: EnumType[];
    sequences: Sequence[];
    generatedAt: string;
}

export interface DatabaseGraph {
  schemas: SchemaGraph[];
  extensions: Extension[];
  migrations: Migration[];
  generatedAt: string;
}
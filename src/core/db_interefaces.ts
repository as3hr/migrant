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
    column: string;
    referencesTable: string;
    referencesColumn: string;
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
    name: string;
    table: string;
    event: string;
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
  
  
  // ==============================
  // Schema
  // ==============================
  
  export interface SchemaGraph {
    tables: Record<string, Table>;
    views: Record<string, View>;
    triggers: Trigger[];
    functions: DatabaseFunction[];
    enums: EnumType[];
    sequences: Sequence[];
    extensions: Extension[];
    generatedAt: string;
  }
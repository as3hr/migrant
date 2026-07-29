export interface CodeFile {
    path: string;
    language: string;
    extension: string;
    size: number;
}

export interface CodeImport {
    id: string;
    importPath: string;
    line: number;
    file: CodeFile;
}

export interface CodeSymbol {
    id: string;
    type: "function" | "class" | "interface" | "variable" | "type";
    name: string;
    file: CodeFile;
    line: number;
}

export interface CodeReference {
    sourceSymbol?: string;
    file: string;
    line: number;

    kind:
        | "database_table"
        | "database_column"
        | "function"
        | "import"
        | "unknown";

    target: string;
}

export interface CodebaseGraph {
    files: CodeFile[];
    symbols: CodeSymbol[];
    references: CodeReference[];
    imports: CodeImport[];
}
import { sqlClient } from "./sqlite.client.ts";

export interface IDocumentModel {
    id: string;
    database_id: string;
    content: string;
    document_type: string;
    embedding_model: string;
    embedding: string;
    metadata?: string | undefined;
    created_at?: string | undefined;
}

export interface ISearchMatchResult {
    id: string;
    content: string;
    document_type: string;
    database_id: string;
    embedding_model: string;
    distance: number;
    metadata: any;
}

function cosineDistance(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        const a = vecA[i] ?? 0;
        const b = vecB[i] ?? 0;
        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
    }
    if (normA === 0 || normB === 0) return 1;
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return 1 - similarity;
}

class TblDocuments {
    private documentInsertStmt: any;
    private documentSelectByDbStmt: any;
    private documentDeleteByDbStmt: any;

    initializeTblDocuments() {
        sqlClient.run(`
            CREATE TABLE IF NOT EXISTS tbl_documents (
                id TEXT PRIMARY KEY,
                database_id TEXT NOT NULL,
                content TEXT NOT NULL,
                document_type TEXT NOT NULL,
                embedding_model TEXT NOT NULL,
                embedding TEXT NOT NULL,
                metadata TEXT NOT NULL DEFAULT '{}',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);


        this.documentInsertStmt = sqlClient.prepare(
            'INSERT OR REPLACE INTO tbl_documents (id, database_id, content, document_type, embedding_model, embedding, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        this.documentSelectByDbStmt = sqlClient.prepare(
            'SELECT * FROM tbl_documents WHERE database_id = ?'
        );
        this.documentDeleteByDbStmt = sqlClient.prepare(
            'DELETE FROM tbl_documents WHERE database_id = ?'
        );
    }

    setDocument(doc: IDocumentModel): boolean {
        const info = this.documentInsertStmt.run(
            doc.id,
            doc.database_id,
            doc.content,
            doc.document_type,
            doc.embedding_model,
            doc.embedding,
            doc.metadata ?? '{}',
            doc.created_at ?? new Date().toISOString()
        );
        return info.changes > 0;
    }

    setDocuments(docs: IDocumentModel[]): void {
        const insertMany = sqlClient.transaction((items: IDocumentModel[]) => {
            for (const doc of items) {
                this.setDocument(doc);
            }
        });
        insertMany(docs);
    }

    getDocumentsByDatabase(databaseId: string): IDocumentModel[] {
        return this.documentSelectByDbStmt.all(databaseId) as IDocumentModel[];
    }

    deleteDocumentsByDatabase(databaseId: string): boolean {
        const info = this.documentDeleteByDbStmt.run(databaseId);
        return info.changes > 0;
    }

    matchDocuments(
        queryEmbedding: number[],
        targetDatabaseId: string,
        matchCount: number = 5
    ): ISearchMatchResult[] {
        const rows = this.getDocumentsByDatabase(targetDatabaseId);
        if (!rows || rows.length === 0) return [];

        const results: ISearchMatchResult[] = [];

        for (const row of rows) {
            try {
                const vec = JSON.parse(row.embedding) as number[];
                const distance = cosineDistance(queryEmbedding, vec);

                let meta: any = {};
                if (row.metadata) {
                    try {
                        meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata;
                    } catch {
                        meta = row.metadata;
                    }
                }

                results.push({
                    id: row.id,
                    content: row.content,
                    document_type: row.document_type,
                    database_id: row.database_id,
                    embedding_model: row.embedding_model,
                    distance,
                    metadata: meta,
                });
            } catch (err) {
                console.error(`Error parsing document embedding for ${row.id}:`, err);
            }
        }

        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, matchCount);
    }
}

export const tblDocuments = new TblDocuments();
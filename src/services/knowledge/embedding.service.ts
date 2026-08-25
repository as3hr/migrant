import { embed, embedMany } from "ai";
import { openRouter } from "../../infrastructure/index.ts";
import { SYS_DEFAULT_EMBEDDING_MODEL } from "../../utils/index.ts";

export class EmbeddingService {
    async createEmbeddings(texts: string[], model?: string, batchSize: number = 20): Promise<number[][]> {
        if (texts.length === 0) return [];

        const batches: string[][] = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            batches.push(texts.slice(i, i + batchSize));
        }

        const batchResults = await Promise.all(
            batches.map(async (batch) => {
                const { embeddings } = await embedMany({
                    model: openRouter.textEmbeddingModel(model ?? SYS_DEFAULT_EMBEDDING_MODEL),
                    values: batch,
                });
                if (!embeddings || embeddings.length !== batch.length) {
                    throw new Error(`Embedding API batch size mismatch: expected ${batch.length}, received ${embeddings?.length ?? 0}`);
                }
                return embeddings;
            })
        );

        const allEmbeddings = batchResults.flat();
        if (allEmbeddings.length !== texts.length) {
            throw new Error(`Total embedding count mismatch: expected ${texts.length}, received ${allEmbeddings.length}`);
        }
        return allEmbeddings;
    }

    async createSingleEmbedding(texts: string[], model?: string): Promise<number[]> {
        const targetText = texts[0] ?? ""; 

        const { embedding } = await embed({
            model: openRouter.textEmbeddingModel(model ?? SYS_DEFAULT_EMBEDDING_MODEL),
            value: targetText,
        });

        if (!embedding) {
            throw new Error("Unexpected embedding response");
        }

        return embedding;
    }
}
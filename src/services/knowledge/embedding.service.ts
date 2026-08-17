import { openRouter, SYS_DEFAULT_EMBEDDING_MODEL } from "@src/exports.ts";
import { embed, embedMany } from "ai";

export class EmbeddingService {
    async createEmbeddings(texts: string[], model?: string): Promise<number[][]> {
        const { embeddings } = await embedMany({
            model: openRouter.textEmbeddingModel(model ?? SYS_DEFAULT_EMBEDDING_MODEL),
            values: texts,
        });

        if (!embeddings || embeddings.length === 0) {
            throw new Error("Unexpected embedding response");
        }

        return embeddings;
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
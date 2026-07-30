import { openRouter } from "@src/exports.ts";
class EmbeddingService {
    async createEmbeddings(texts: string[]): Promise<number[][]> {
        const response = await openRouter.embeddings.generate({
            requestBody: {
                input: texts,
                model: "text-embedding-3-small",
            },
        });

        if (!response || typeof response === "string") {
            throw new Error("Unexpected embedding response");
        }

        return response.data.map(item => item.embedding as number[]);
    }

    async createSingleEmbedding(texts: string[]): Promise<number[]> {
        const response = await openRouter.embeddings.generate({
            requestBody: {
                input: texts,
                model: "text-embedding-3-small",
            },
        });

        if (!response || typeof response === "string") {
            throw new Error("Unexpected embedding response");
        }

        return response.data[0]?.embedding as number[];
    }
}

export const embeddingService = new EmbeddingService();

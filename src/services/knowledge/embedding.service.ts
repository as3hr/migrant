import { openRouter, SYS_DEFAULT_EMBEDDING_MODEL } from "@src/exports.ts";
class EmbeddingService {
    async createEmbeddings(texts: string[], model?: string): Promise<number[][]> {
        const response = await openRouter.embeddings.generate({
            requestBody: {
                input: texts,
                model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
            },
        });

        if (!response || typeof response === "string") {
            throw new Error("Unexpected embedding response");
        }

        const data = response.data.map((item) => {
            const embedding = item.embedding;
            if (typeof embedding === 'string') {
                return undefined;
            }
            return embedding;
        }).filter(item => item != undefined);

        return data;
    }

    async createSingleEmbedding(texts: string[], model?: string): Promise<number[]> {
        const response = await openRouter.embeddings.generate({
            requestBody: {
                input: texts,
                model: model ?? SYS_DEFAULT_EMBEDDING_MODEL,
            },
        });

        if (!response || typeof response === "string") {
            throw new Error("Unexpected embedding response");
        }

        return response.data[0]?.embedding as number[];
    }
}

export const embeddingService = new EmbeddingService();
import { openRouter } from "../config/open_router.ts";

export class AIService {
    async createEmbeddings(data: any): Promise<number[]> {
        try {
            console.log('Creating embeddings for data:', data);
            const response = await openRouter.embeddings.generate({
                requestBody: {
                    input: JSON.stringify(data),
                    model: "text-embedding-3-small",
                }
            });
            
            if (!response) {
                throw new Error('No embedding found');
            }
            if (typeof response === "string") {
                throw new Error("Unexpected embedding response");
            }
            
            const embedding = response.data[0]?.embedding;

            if (typeof embedding === "string" || !embedding) {
                throw new Error("Unexpected embedding response");
            }

            return embedding;
        } catch (error) {
            console.error('Error creating embeddings:', error);
            throw new Error('Failed to create embeddings');
        }
    }
}
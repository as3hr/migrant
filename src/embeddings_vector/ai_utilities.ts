import type { CreateEmbeddingsResponse } from "@openrouter/sdk/models/operations";
import { openRouter } from "../config/open_router.ts";

export class AIUtilities {
    async createEmbeddings(data: any): Promise<CreateEmbeddingsResponse> {
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
            return response;
        } catch (error) {
            console.error('Error creating embeddings:', error);
            throw new Error('Failed to create embeddings');
        }
    }
}
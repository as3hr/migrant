import { fileService, llmService, ragService } from "@src/exports.ts";

export async function userQuery(query: string) {
    try {
        const semanticResult = await ragService.performSemanticSearch(query);

        if (!semanticResult) {
            console.log('Null returned in semantic result');
            return;
        }

        const prompt = `
            You are Migrant AI, an expert PostgreSQL database engineer.
            
            Your job is to answer ONLY using the supplied database context.
            
            Rules:
            - Do not invent tables or columns.
            - If the answer is not present, clearly say you don't know.
            - Mention relationships if relevant.
            - Be concise and technical.
            
            User Question:
            ${query}
            
            Database Context:
            
            ${semanticResult?.context}
        `;
        
        const response = await llmService.queryLlm(
            "You are an expert PostgreSQL database engineer.",
            prompt,
            "deepseek/deepseek-chat"
        );
        
        await fileService.writeDataToFile(response, '"logs/query_result.json"');

    } catch (error) {
        console.log('Error in userQuery func', error);     
    }
}
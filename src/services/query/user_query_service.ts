import type { ChatContentItems } from "@openrouter/sdk/models";
import { appContext, SYS_PROMPT } from "@src/exports.ts";

export async function userQuery(query: string): Promise<{
    Question: string;
    Answer: string | ChatContentItems[];
} | null> {
    try {
        const semanticResult = await appContext.services.ragService.performSemanticSearch(query);

        if (!semanticResult) {
            console.log('Null returned in semantic result');
            return null;
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
        
        const response = await appContext.services.llmService.queryLlm(
            SYS_PROMPT,
            prompt,
            "deepseek/deepseek-chat"
        );

        if (response && response.choices && response?.choices.length > 0) {
            const answer = response?.choices[0]?.message.content;
            if (answer) {
                const result = {
                    Question: query,
                    Answer: answer,
                }
                return result;
            }
            return null;
        } else {
            console.log('No response from llm found or an error', response);
            return null;
        }
    } catch (error) {
        console.log('Error in userQuery func', error);     
        return null;
    }
}
import { appContext, SYS_PROMPT, type CommandContext } from "@src/exports.ts";

export async function userQuery(query: string, databaseId: string, ctx: CommandContext) {
    try {
        let response = '';
        const semanticResult = await appContext.services.ragService.performSemanticSearch(query, databaseId);

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
        
        const stream = appContext.services.llmService.streamLlm(
            SYS_PROMPT,
            prompt,
            "deepseek/deepseek-chat",
        );

        let firstChunk = true;
        for await (const chunk of stream) {
            response += chunk;
            if (firstChunk) {
                ctx.log(response);
                firstChunk = false;
            } else {
                ctx.replaceLast(response);
            }
        }

    } catch (error) {
        console.log('Error in userQuery func', error);     
        return null;
    }
}
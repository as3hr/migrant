import { embeddingService, openRouter, supabase } from "@src/exports.ts";
import fs from "fs";

export async function userQuery(query: string) {
    console.log("User Query:", query);

    // 1. Embed the user's question
    const embedding = await embeddingService.createSingleEmbedding([query]);
    const queryEmbedding = `[${embedding.join(",")}]`;

    // 2. Retrieve relevant documents
    const { data, error } = await supabase.rpc("match_documents", {
        query_embedding: queryEmbedding,
        match_count: 5,
    });

    if (error) {
        console.error("Error retrieving documents:", error);
        return;
    }

    // 3. Build context
    const context = data
        .map((doc: any, index: number) => {
            return `
<Document ${index + 1}>
Type: ${doc.document_type ?? "unknown"}

${doc.content}
</Document ${index + 1}>
`;
        })
        .join("\n");

    // 4. Build prompt
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

${context}
`;

    const response = await openRouter.chat.send({
        chatRequest: {
            model: "deepseek/deepseek-chat",
            stream: false,
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert PostgreSQL database engineer.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        },
    });

    console.log(response);

    await writeDataToFile(response);
}

async function writeDataToFile(result: unknown): Promise<void> {
    fs.writeFile(
        "logs/query_result.json",
        JSON.stringify(result, null, 2),
        () => {}
    );
}
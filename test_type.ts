import { generateText, type CoreMessage } from "ai";

async function test() {
  const { toolCalls } = await generateText({
    model: {} as any,
    prompt: "hi",
    tools: {}
  });

  const msgs: CoreMessage[] = [];
  msgs.push({
    role: "assistant",
    content: toolCalls
  });
}

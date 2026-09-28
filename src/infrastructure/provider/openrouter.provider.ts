import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { supabase } from "../db/supabase/supabase.client.ts";

async function getKey(): Promise<string> {
    const { data, error } = await supabase.functions.invoke("get-open-router-key");

    if (error || !data) {
        throw error;
    }

    return data.key;
}

const key = await getKey();

export const openRouter = createOpenRouter({
    apiKey: key,
});
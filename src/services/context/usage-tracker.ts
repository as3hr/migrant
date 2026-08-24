import { supabase } from "@src/exports.ts";

export interface ModelPrice {
    inputPer1M: number;
    outputPer1M: number;
}

export const MODEL_PRICES: Record<string, ModelPrice> = {
    "openai/gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.60 },
    "deepseek/deepseek-chat": { inputPer1M: 0.14, outputPer1M: 0.28 },
    "anthropic/claude-3-5-sonnet": { inputPer1M: 3.00, outputPer1M: 15.00 },
    "openai/gpt-4o": { inputPer1M: 2.50, outputPer1M: 10.00 },
};

export interface RecordUsageParams {
    userId: string;
    databaseId?: string | null;
    provider: string;
    modelName: string;
    promptTokens: number;
    completionTokens: number;
    targetAgent: string;
    isByok?: boolean;
}

export class UsageTrackerService {
    calculateCostUsd(modelName: string, promptTokens: number, completionTokens: number): number {
        const price = MODEL_PRICES[modelName] ?? { inputPer1M: 0.20, outputPer1M: 0.50 };
        const inputCost = (promptTokens / 1_000_000) * price.inputPer1M;
        const outputCost = (completionTokens / 1_000_000) * price.outputPer1M;
        return Number((inputCost + outputCost).toFixed(6));
    }

    async recordUsage(params: RecordUsageParams): Promise<boolean> {
        try {
            const costUsd = this.calculateCostUsd(
                params.modelName,
                params.promptTokens,
                params.completionTokens
            );

            const { error } = await supabase.from("user_usage_logs").insert({
                user_id: params.userId,
                database_id: params.databaseId ?? null,
                provider: params.provider,
                model_name: params.modelName,
                prompt_tokens: params.promptTokens,
                completion_tokens: params.completionTokens,
                total_tokens: params.promptTokens + params.completionTokens,
                cost_usd: costUsd,
                is_byok: params.isByok ?? false,
                target_agent: params.targetAgent,
            });

            if (error) {
                console.error("[UsageTrackerService] Error logging usage:", error.message);
                return false;
            }

            return true;
        } catch (err) {
            console.error("[UsageTrackerService] Exception logging usage:", err);
            return false;
        }
    }
}

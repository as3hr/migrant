import { supabase } from "../../infrastructure/db/supabase/supabase.client.ts";
import { getModelById } from "../../infrastructure/provider/providers.ts";

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
    /** Calculate cost in USD for given token usage dynamically from providers catalog */
    calculateCostUsd(modelName: string, promptTokens: number, completionTokens: number): number {
        const modelConfig = getModelById(modelName);
        const inputPrice = modelConfig?.inputPer1M ?? 0.20;
        const outputPrice = modelConfig?.outputPer1M ?? 0.50;

        const inputCost = (promptTokens / 1_000_000) * inputPrice;
        const outputCost = (completionTokens / 1_000_000) * outputPrice;
        return Number((inputCost + outputCost).toFixed(6));
    }

    /** Log usage event into Supabase user_usage_logs table */
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

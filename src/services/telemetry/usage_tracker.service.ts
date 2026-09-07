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

    /** Log usage event locally */
    async recordUsage(params: RecordUsageParams): Promise<boolean> {
        return true;
    }
}

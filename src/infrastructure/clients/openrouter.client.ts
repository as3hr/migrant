import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { appConfig } from "@src/exports.ts";

export const openRouter = createOpenRouter({
  apiKey: appConfig.openRouterApiKey,
});
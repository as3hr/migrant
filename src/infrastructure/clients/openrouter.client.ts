import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { appConfig } from '../index.ts';

export const openRouter = createOpenRouter({
  apiKey: appConfig.openRouterApiKey,
});
import { OpenRouter } from '@openrouter/sdk';
import { appConfig } from "@src/exports.ts";
import OpenAI from 'openai';

export const openRouter = new OpenRouter({
  apiKey: appConfig.openRouterApiKey,
});

export const openAI = new OpenAI({
    baseURL: 'https://openrouter.ai',
    apiKey: appConfig.openRouterApiKey, 
    defaultHeaders: {
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'Migrant',
    }
});
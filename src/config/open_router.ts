import { OpenRouter } from '@openrouter/sdk';
import { OpenAI } from 'openai';
import { appConfig } from './app.config.ts';

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
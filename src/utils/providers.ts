// // providers.ts
// import { createAnthropic } from '@ai-sdk/anthropic';
// import { createCerebras } from '@ai-sdk/cerebras';
// import { createCohere } from '@ai-sdk/cohere';
// import { createDeepInfra } from '@ai-sdk/deepinfra';
// import { createDeepSeek } from '@ai-sdk/deepseek';
// import { createFireworks } from '@ai-sdk/fireworks';
// import { createGoogleGenerativeAI } from '@ai-sdk/google';
// import { createGroq } from '@ai-sdk/groq';
// import { createMistral } from '@ai-sdk/mistral';
// import { createOpenAI } from '@ai-sdk/openai';
// import { createPerplexity } from '@ai-sdk/perplexity';
// import { createTogetherAI } from '@ai-sdk/togetherai';
// import { createXai } from '@ai-sdk/xai';
// import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// export type ProviderId =
//   | 'anthropic'
//   | 'openai'
//   | 'google'
//   | 'mistral'
//   | 'cohere'
//   | 'groq'
//   | 'xai'
//   | 'deepseek'
//   | 'cerebras'
//   | 'perplexity'
//   | 'fireworks'
//   | 'togetherai'
//   | 'deepinfra'
//   | 'openrouter';

// export interface ProviderConfig {
//   id: ProviderId;
//   name: string;
//   description: string;
//   apiKeyEnv: string;
//   apiKeyUrl: string; 
//   create: (apiKey: string) => unknown;
// }

// export const PROVIDERS: ProviderConfig[] = [
//   {
//     id: 'anthropic',
//     name: 'Anthropic',
//     description: 'Claude models',
//     apiKeyEnv: 'ANTHROPIC_API_KEY',
//     apiKeyUrl: 'https://console.anthropic.com/keys',
//     create: (apiKey) => createAnthropic({ apiKey }),
//   },
//   {
//     id: 'openai',
//     name: 'OpenAI',
//     description: 'GPT & o-series models',
//     apiKeyEnv: 'OPENAI_API_KEY',
//     apiKeyUrl: 'https://platform.openai.com/api-keys',
//     create: (apiKey) => createOpenAI({ apiKey }),
//   },
//   {
//     id: 'google',
//     name: 'Google',
//     description: 'Gemini models',
//     apiKeyEnv: 'GOOGLE_GENERATIVE_AI_API_KEY',
//     apiKeyUrl: 'https://aistudio.google.com/app/apikey',
//     create: (apiKey) => createGoogleGenerativeAI({ apiKey }),
//   },
//   {
//     id: 'mistral',
//     name: 'Mistral',
//     description: 'Mistral & Codestral models',
//     apiKeyEnv: 'MISTRAL_API_KEY',
//     apiKeyUrl: 'https://console.mistral.ai/api-keys',
//     create: (apiKey) => createMistral({ apiKey }),
//   },
//   {
//     id: 'groq',
//     name: 'Groq',
//     description: 'Fast inference for open models',
//     apiKeyEnv: 'GROQ_API_KEY',
//     apiKeyUrl: 'https://console.groq.com/keys',
//     create: (apiKey) => createGroq({ apiKey }),
//   },
//   {
//     id: 'xai',
//     name: 'xAI',
//     description: 'Grok models',
//     apiKeyEnv: 'XAI_API_KEY',
//     apiKeyUrl: 'https://console.x.ai',
//     create: (apiKey) => createXai({ apiKey }),
//   },
//   {
//     id: 'deepseek',
//     name: 'DeepSeek',
//     description: 'DeepSeek reasoning & chat models',
//     apiKeyEnv: 'DEEPSEEK_API_KEY',
//     apiKeyUrl: 'https://platform.deepseek.com/api_keys',
//     create: (apiKey) => createDeepSeek({ apiKey }),
//   },
//   {
//     id: 'cerebras',
//     name: 'Cerebras',
//     description: 'Ultra-fast Llama inference',
//     apiKeyEnv: 'CEREBRAS_API_KEY',
//     apiKeyUrl: 'https://cloud.cerebras.ai',
//     create: (apiKey) => createCerebras({ apiKey }),
//   },
//   {
//     id: 'cohere',
//     name: 'Cohere',
//     description: 'Command models',
//     apiKeyEnv: 'COHERE_API_KEY',
//     apiKeyUrl: 'https://dashboard.cohere.com/api-keys',
//     create: (apiKey) => createCohere({ apiKey }),
//   },
//   {
//     id: 'perplexity',
//     name: 'Perplexity',
//     description: 'Search-augmented models',
//     apiKeyEnv: 'PERPLEXITY_API_KEY',
//     apiKeyUrl: 'https://www.perplexity.ai/settings/api',
//     create: (apiKey) => createPerplexity({ apiKey }),
//   },
//   {
//     id: 'fireworks',
//     name: 'Fireworks',
//     description: 'Fast open model hosting',
//     apiKeyEnv: 'FIREWORKS_API_KEY',
//     apiKeyUrl: 'https://fireworks.ai/api-keys',
//     create: (apiKey) => createFireworks({ apiKey }),
//   },
//   {
//     id: 'togetherai',
//     name: 'Together AI',
//     description: 'Open model hosting',
//     apiKeyEnv: 'TOGETHER_AI_API_KEY',
//     apiKeyUrl: 'https://api.together.ai/settings/api-keys',
//     create: (apiKey) => createTogetherAI({ apiKey }),
//   },
//   {
//     id: 'deepinfra',
//     name: 'DeepInfra',
//     description: 'Cheap open model inference',
//     apiKeyEnv: 'DEEPINFRA_API_KEY',
//     apiKeyUrl: 'https://deepinfra.com/dash/api_keys',
//     create: (apiKey) => createDeepInfra({ apiKey }),
//   },
//   {
//     id: 'openrouter',
//     name: 'OpenRouter',
//     description: 'Multi-provider gateway',
//     apiKeyEnv: 'OPENROUTER_API_KEY',
//     apiKeyUrl: 'https://openrouter.ai/keys',
//     create: (apiKey) => createOpenRouter({ apiKey }),
//   },
// ];

// export function getProvider(id: ProviderId, apiKey: string) {
//   const provider = PROVIDERS.find((p) => p.id === id);
//   if (!provider) throw new Error(`Unknown provider: ${id}`);
//   return provider.create(apiKey);
// }
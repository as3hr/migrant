import type { AnthropicProvider } from '@ai-sdk/anthropic';
import type { DeepSeekProvider } from '@ai-sdk/deepseek';
import type { GoogleProvider } from '@ai-sdk/google';
import type { MistralProvider } from '@ai-sdk/mistral';
import type { OpenAIProvider } from '@ai-sdk/openai';
import type { XaiProvider } from '@ai-sdk/xai';
import type { OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import { LocalProviderRepository } from '../../local/index.ts';
import { credentialStore } from '../index.ts';

export type ProviderId =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'mistral'
  | 'xai'
  | 'deepseek'
  | 'openrouter';

export type ProviderSDK = OpenRouterProvider |
  AnthropicProvider | DeepSeekProvider | MistralProvider | OpenAIProvider | GoogleProvider | XaiProvider;

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  description: string;
  apiKeyEnv: string;
  apiKeyUrl: string;
  create: (apiKey: string) => Promise<ProviderSDK>;
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  inputPer1M: number;
  outputPer1M: number;
}

export const PROVIDER_MODELS: Record<ProviderId, ModelConfig[]> = {
  anthropic: [
    { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', description: 'Most capable', inputPer1M: 15.00, outputPer1M: 75.00 },
    { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', description: 'Best balance', inputPer1M: 3.00, outputPer1M: 15.00 },
    { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', description: 'Fast and cheap', inputPer1M: 0.80, outputPer1M: 4.00 },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable', inputPer1M: 2.50, outputPer1M: 10.00 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cheap', inputPer1M: 0.15, outputPer1M: 0.60 },
    { id: 'o3-mini', name: 'o3 Mini', description: 'Reasoning model', inputPer1M: 1.10, outputPer1M: 4.40 },
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast and capable', inputPer1M: 0.10, outputPer1M: 0.40 },
    { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', description: 'Most capable', inputPer1M: 1.25, outputPer1M: 5.00 },
  ],
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Most capable', inputPer1M: 2.00, outputPer1M: 6.00 },
    { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Fast and cheap', inputPer1M: 0.10, outputPer1M: 0.30 },
  ],
  xai: [
    { id: 'grok-3', name: 'Grok 3', description: 'Most capable', inputPer1M: 3.00, outputPer1M: 15.00 },
    { id: 'grok-3-mini', name: 'Grok 3 Mini', description: 'Fast and cheap', inputPer1M: 0.30, outputPer1M: 0.50 },
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek V3', description: 'Best value', inputPer1M: 0.14, outputPer1M: 0.28 },
    { id: 'deepseek-reasoner', name: 'DeepSeek R1', description: 'Reasoning model', inputPer1M: 0.55, outputPer1M: 2.19 },
  ],
  openrouter: [
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat via OpenRouter', description: 'Best value', inputPer1M: 0.40, outputPer1M: 0.90 },
    { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner via OpenRouter', description: 'Reasoning model', inputPer1M: 0.75, outputPer1M: 2.19 },
  ],
};

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    apiKeyUrl: 'https://console.anthropic.com/keys',
    create: async (apiKey) => {
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      return createAnthropic({ apiKey });
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT & o-series models',
    apiKeyEnv: 'OPENAI_API_KEY',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    create: async (apiKey) => {
      const { createOpenAI } = await import('@ai-sdk/openai');
      return createOpenAI({ apiKey });
    },
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Gemini models',
    apiKeyEnv: 'GOOGLE_GENERATIVE_AI_API_KEY',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    create: async (apiKey) => {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
      return createGoogleGenerativeAI({ apiKey });
    },
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral & Codestral models',
    apiKeyEnv: 'MISTRAL_API_KEY',
    apiKeyUrl: 'https://console.mistral.ai/api-keys',
    create: async (apiKey) => {
      const { createMistral } = await import('@ai-sdk/mistral');
      return createMistral({ apiKey });
    },
  },
  {
    id: 'xai',
    name: 'xAI',
    description: 'Grok models',
    apiKeyEnv: 'XAI_API_KEY',
    apiKeyUrl: 'https://console.x.ai',
    create: async (apiKey) => {
      const { createXai } = await import('@ai-sdk/xai');
      return createXai({ apiKey });
    },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek reasoning & chat models',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    create: async (apiKey) => {
      const { createDeepSeek } = await import('@ai-sdk/deepseek');
      return createDeepSeek({ apiKey });
    },
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access any model via one key',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    apiKeyUrl: 'https://openrouter.ai/keys',
    create: async (apiKey) => {
      const { createOpenRouter } = await import('@openrouter/ai-sdk-provider');
      return createOpenRouter({ apiKey });
    },
  },
];

export async function setProvider(id: ProviderId, apiKey: string) {
    const provider = PROVIDERS.find((p) => p.id === id);
    if (!provider) throw new Error(`Unknown provider: ${id}`);
    await credentialStore.set(provider.apiKeyEnv, apiKey);
    const providerSdk = await provider.create(apiKey);
    return providerSdk;
}

export function setProviderToLocal(id: ProviderId, apiKeyEnv: string, userId: string) {
    new LocalProviderRepository().setProvider({ id, user_id: userId, api_key_env: apiKeyEnv });
}

export function getModels(id: ProviderId): ModelConfig[] {
  return PROVIDER_MODELS[id];
}

export function getModelById(id: string): ModelConfig | undefined {
  return Object.values(PROVIDER_MODELS).flat().find((m) => m.id === id);
}

export function getModelLabel(model: ModelConfig): string {
  if (!model.name) {
    return model.id;
  }
  return `${model.name} (${model.id})`;
}

export function getProviderLabel(provider: ProviderConfig): string {
  if (!provider.name) {
    return provider.id;
  }
  return `${provider.name} (${provider.id})`;
}


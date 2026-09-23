import { appContext, type CommandDefinition } from "../../domain/index.ts";
import {
  appConfig,
  getModelById,
  PROVIDERS,
  PROVIDER_MODELS,
  setProvider,
  setProviderToLocal,
  tblChatSessions,
  type ProviderId,
} from "../../infrastructure/index.ts";
import { credentialStore } from "../../infrastructure/security/credential_store.ts";
import { appEmitter } from "../../utils/emitter.ts";

export const modelsCommand: CommandDefinition = {
  name: "models",
  description: "Select AI Provider & Model",
  busyLabel: "Configuring Model...",
  requiresAuth: true,
  execute: async (args, ctx) => {
    const selectedArg = args.trim();
    if (!selectedArg) {
      ctx.log("Usage: /models or select from popup");
      return;
    }

    let [providerIdStr, modelIdStr] = selectedArg.split(":");
    if (!modelIdStr && providerIdStr) {
      modelIdStr = providerIdStr;
      const found = getModelById(modelIdStr);
      if (found) {
        for (const [pId, models] of Object.entries(PROVIDER_MODELS)) {
          if (models.some((m) => m.id === modelIdStr)) {
            providerIdStr = pId;
            break;
          }
        }
      }
    }

    if (!modelIdStr || !providerIdStr) {
      ctx.error(`Invalid model or provider specification: "${selectedArg}"`);
      return;
    }

    const providerId = providerIdStr as ProviderId;
    const modelConfig = getModelById(modelIdStr);
    const providerConfig = PROVIDERS.find((p) => p.id === providerId);

    if (!modelConfig || !providerConfig) {
      ctx.error(`Invalid model or provider specification: "${selectedArg}"`);
      return;
    }

    // 1. Get stored key or ask user
    let apiKey: string | null = await credentialStore.get(providerConfig.apiKeyEnv);
    if (!apiKey && providerId === "openrouter" && appConfig.openRouterApiKey) {
      apiKey = appConfig.openRouterApiKey;
    }

    if (!apiKey) {
      apiKey = await ctx.ask(`Enter API Key for ${providerConfig.name} (${providerConfig.apiKeyEnv})`, {
        mask: "*",
        placeholder: `Paste ${providerConfig.name} API key...`,
      });
      apiKey = apiKey.trim();
    }

    if (!apiKey) {
      ctx.error(`API Key required for ${providerConfig.name}. Setup cancelled.`);
      return;
    }

    // 2. Validate API Key with test probe
    ctx.busy(`Validating ${providerConfig.name} API key...`);
    try {
      const testSdk = await providerConfig.create(apiKey);
      const { generateText } = await import("ai");
      await generateText({
        model: testSdk(modelConfig.id),
        prompt: "test",
        maxOutputTokens: 1,
      });
    } catch (err: any) {
      ctx.error(`API Key validation failed for ${providerConfig.name}: ${err?.message || err}`);
      ctx.error(`Please check your ${providerConfig.apiKeyEnv} and try again.`);
      return;
    }

    // 3. Key valid! Save & apply
    ctx.busy("Applying model configuration...");
    const user = await appContext.services.authService.getCurrentUser();
    const sdk = await setProvider(providerId, apiKey);
    if (user) {
      setProviderToLocal(providerId, providerConfig.apiKeyEnv, user.id);
    }

    appContext.providerSdk = sdk;
    appContext.setSelectedModel(modelConfig.id, providerId);

    // 4. Update session token limit if active
    const currentSessionId = appContext.currentChatSessionId;
    if (currentSessionId) {
      const currentSession = tblChatSessions.getChatSessionById(currentSessionId);
      if (currentSession) {
        const updatedSession = tblChatSessions.setChatSession({
          ...currentSession,
          session_token_limit: modelConfig.contextWindow,
          updated_at: new Date().toISOString(),
        });
        if (updatedSession) {
          appEmitter.emit("update-session", { updatedSession });
        }
      }
    }

    // 5. Emit update-model event
    appEmitter.emit("update-model", { model: modelConfig.id });

    ctx.success(`Active AI model set to: ${modelConfig.name} (${modelConfig.id})`);
  },
};

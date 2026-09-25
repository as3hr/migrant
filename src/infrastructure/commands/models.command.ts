import { appContext, type CommandDefinition } from "../../domain/index.ts";
import {
  getModelById,
  PROVIDER_MODELS,
  PROVIDERS,
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
    const parts = args.trim().split(/\s+/);
    const selectedArg = parts[0] || "";
    const passedApiKey = parts[1] || "";

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

    const apiKey: string | null = passedApiKey || (await credentialStore.get(providerConfig.apiKeyEnv));

    if (!apiKey) {
      ctx.error(`API Key required for ${providerConfig.name}. Please select the model from the /models popup to enter your key.`);
      return;
    }

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

    ctx.busy("Applying model configuration...");
    const user = await appContext.services.authService.getCurrentUser();
    const sdk = await setProvider(providerId, apiKey);
    if (user) {
      setProviderToLocal({id: providerId, user_id: user.id, api_key_env: providerConfig.apiKeyEnv, selected_model_id: modelConfig.id});
    }

    appContext.providerSdk = sdk;
    appContext.setSelectedModel(modelConfig.id, providerId);

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

    appEmitter.emit("update-model", { model: modelConfig.id });
    ctx.success(`Active AI model set to: ${modelConfig.name} (${modelConfig.id})`);
  },
};

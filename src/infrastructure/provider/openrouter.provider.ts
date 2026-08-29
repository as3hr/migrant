import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { appConfig } from "../config/app.config.ts";

export const openRouter = createOpenRouter({
    apiKey: appConfig.openRouterApiKey,
});

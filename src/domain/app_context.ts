import { connectCommand, createHelpCommand, exitCommand, loginCommand, logoutCommand, modelsCommand, sessionsCommand } from "../infrastructure/commands/index.ts";
import { tblProvider } from "../infrastructure/db/sqlite/tbl_provider.ts";
import { appConfig, PROVIDERS, setProvider, setProviderToLocal, type ProviderId, type ProviderSDK } from "../infrastructure/index.ts";
import { credentialStore } from "../infrastructure/security/credential_store.ts";
import {
    AuthService,
    ChatSessionService,
    ContextManager,
    DatabaseConnectionService,
    EmbeddingService,
    LlmService,
    MemoryService,
    RagService
} from "../services/index.ts";
import { SYS_DEFAULT_MODEL } from "../utils/constants.ts";
import { appEmitter } from "../utils/emitter.ts";
import { CommandRegistry, WorkSpace, type CommandContext } from "./index.ts";

interface AppServices {
    authService: AuthService;
    databaseConnectionService: DatabaseConnectionService;
    chatSessionService: ChatSessionService;
    databaseRegistryService: DatabaseConnectionService;
    databaseService: ChatSessionService;
    ragService: RagService;
    llmService: LlmService;
    embeddingService: EmbeddingService;
    memoryService: MemoryService;
    contextManager: ContextManager;
}

interface ProviderModel {
    modelId: string;
    providerId: ProviderId;
}

class AppContext {
    selectedModel: ProviderModel;
    commandRegistry: CommandRegistry;
    workspace: WorkSpace;
    services: AppServices;
    commandCtx?: CommandContext; 
    providerSdk: ProviderSDK;
    currentChatSessionId: string | undefined;

    private constructor(
        providerSdk: ProviderSDK,
        services: AppServices,
        initialModel: ProviderModel
    ) {
        this.providerSdk = providerSdk;
        this.services = services;
        this.selectedModel = initialModel;
        this.commandRegistry = this.buildCommandRegistry();
        this.workspace = new WorkSpace();
        this.setSelectedModel(initialModel.modelId, initialModel.providerId);
    }

    static async create(): Promise<AppContext> {
        let providerId: ProviderId = "openrouter";
        let modelId = SYS_DEFAULT_MODEL;
        let apiKey: string | null = null;

        const savedProvider = tblProvider.getActiveProvider();
        if (savedProvider) {
            apiKey = await credentialStore.get(savedProvider.api_key_env);
            if (apiKey) {
                providerId = savedProvider.id;
                modelId = savedProvider.selected_model_id;
            }
        }

        if (!apiKey) {
            apiKey = appConfig.openRouterApiKey;
            providerId = "openrouter";
        }

        const providerSdk = await setProvider(providerId, apiKey);
        const services = this.createServices();
        const user = await services.authService.getCurrentUser();
        if (!savedProvider && user) {
            const providerConfig = PROVIDERS.find((p) => p.id === providerId);
            setProviderToLocal({
                id: providerId,
                user_id: user.id,
                api_key_env: providerConfig?.apiKeyEnv || "OPENROUTER_API_KEY",
                selected_model_id: modelId
            });
        }

        appEmitter.emit('update-model', {
            model: modelId,
        });

        return new AppContext(providerSdk, services, { modelId, providerId });
    }

    setCurrentChatSessionId(sessionId: string) {
        this.currentChatSessionId = sessionId;
    }

    createCommandContext(commandCtx: CommandContext) {
        this.commandCtx = commandCtx;
    }

    setSelectedModel(modelId: string, providerId: ProviderId) {
        this.selectedModel = { modelId, providerId };
    }
    
    buildCommandRegistry() {
      const registry = new CommandRegistry();
    
      registry.register(loginCommand);
      registry.register(connectCommand);
      registry.register(exitCommand);
      registry.register(logoutCommand);
      registry.register(sessionsCommand);
      registry.register(modelsCommand);
      registry.register(createHelpCommand(registry));
    
      return registry;
    }

    private static createServices() {
        const databaseConnectionService = new DatabaseConnectionService();
        const chatSessionService = new ChatSessionService();

        return {
            authService: new AuthService(),
            databaseConnectionService,
            chatSessionService,
            databaseRegistryService: databaseConnectionService,
            databaseService: chatSessionService,
            ragService: new RagService(),
            llmService: new LlmService(),
            embeddingService: new EmbeddingService(),
            memoryService: new MemoryService(),
            contextManager: new ContextManager()
        };
    }
}

export const appContext = await AppContext.create();
import { connectCommand, createHelpCommand, disconnectCommand, exitCommand, loginCommand, logoutCommand, modelsCommand, newSessionCommand, renameDbCommand, renameSessionCommand, sessionsCommand } from "../infrastructure/commands/index.ts";
import { initializeDatabase } from "../infrastructure/db/sqlite/sqlite.client.ts";
import { tblProvider } from "../infrastructure/db/sqlite/tbl_provider.ts";
import { DocIndex } from "../infrastructure/engine/core/doc_index.ts";
import { LlmService } from "../infrastructure/engine/core/llm.ts";
import { PROVIDERS, setProvider, setProviderToLocal, type ProviderId, type ProviderSDK } from "../infrastructure/index.ts";
import { credentialStore } from "../infrastructure/security/credential_store.ts";
import {
    AuthService,
    ChatSessionService,
    ContextManager,
    DatabaseConnectionService,
    EmbeddingService,
    MemoryService,
} from "../services/index.ts";
import { emitEvent } from "../utils/emitter.ts";
import { CommandRegistry, type CommandContext } from "./command-shell.ts";
import { WorkSpace } from "./workspace.ts";

interface AppServices {
    authService: AuthService;
    databaseConnectionService: DatabaseConnectionService;
    chatSessionService: ChatSessionService;
    databaseRegistryService: DatabaseConnectionService;
    databaseService: ChatSessionService;
    docIndex: DocIndex;
    llm: LlmService;
    embeddingService: EmbeddingService;
    memoryService: MemoryService;
    contextManager: ContextManager;
}

interface ProviderModel {
    modelId: string | undefined;
    providerId: ProviderId | undefined;
}

class AppContext {
    selectedModel: ProviderModel;
    commandRegistry: CommandRegistry;
    workspace: WorkSpace;
    services: AppServices;
    commandCtx?: CommandContext; 
    providerSdk: ProviderSDK | undefined;
    currentChatSessionId: string | undefined;

    private constructor(
        services: AppServices,
        initialModel: ProviderModel,
        providerSdk: ProviderSDK | undefined,
    ) {
        this.providerSdk = providerSdk;
        this.services = services;
        this.selectedModel = initialModel;
        this.commandRegistry = this.buildCommandRegistry();
        this.workspace = new WorkSpace();
        if (initialModel.modelId && initialModel.providerId) {
            this.setSelectedModel(initialModel.modelId, initialModel.providerId);
        }
    }

    static async create(): Promise<AppContext> {
        initializeDatabase();

        let apiKey: string | null = null;
        let providerId: ProviderId | undefined;
        let modelId: string | undefined;

        const savedProvider = tblProvider.getActiveProvider();
        if (savedProvider) {
            apiKey = await credentialStore.get(savedProvider.api_key_env);
            if (apiKey) {
                providerId = savedProvider.id;
                modelId = savedProvider.selected_model_id;
            }
        }
        const services = this.createServices();

        let providerSdk: ProviderSDK | undefined;
        if (apiKey && providerId && modelId) {
            providerSdk = await setProvider(providerId, apiKey);
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

            emitEvent.emit('update-model', {
                model: modelId,
            });
        }

        return new AppContext(services, { modelId, providerId }, providerSdk);
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
        registry.register(disconnectCommand);
        registry.register(newSessionCommand);
        registry.register(renameSessionCommand);
        registry.register(renameDbCommand);
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
            docIndex: new DocIndex(),
            llm: new LlmService(),
            embeddingService: new EmbeddingService(),
            memoryService: new MemoryService(),
            contextManager: new ContextManager()
        };
    }
}

let _appContext: AppContext | null = null;

export async function initAppContext(): Promise<AppContext> {
    _appContext = await AppContext.create();
    appContext = _appContext;
    return _appContext;
}

export let appContext: AppContext = null as unknown as AppContext;
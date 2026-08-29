import { appConfig, setProvider, setProviderToLocal, type ProviderId, type ProviderSDK } from "../infrastructure/index.ts";
import {
    AuthService,
    CloudSyncService,
    ContextManager,
    DbRegistryService,
    EmbeddingService,
    LlmService,
    MemoryService,
    RagService,
    UsageTrackerService
} from "../services/index.ts";
import { clearCommand, connectCommand, createHelpCommand, exitCommand, loginCommand, logoutCommand } from "../ui/commands/index.ts";
import { SYS_DEFAULT_MODEL } from "../utils/constants.ts";
import { CommandRegistry, WorkSpace, type CommandContext } from "./index.ts";

interface AppServices {
    authService: AuthService;
    databaseRegistryService: DbRegistryService;
    databaseService: CloudSyncService;
    ragService: RagService;
    llmService: LlmService;
    embeddingService: EmbeddingService;
    memoryService: MemoryService;
    contextManager: ContextManager;
    usageTracker: UsageTrackerService;
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
        services: AppServices
    ) {
        this.providerSdk = providerSdk;
        this.commandRegistry = this.buildCommandRegistry();
        this.workspace = new WorkSpace();
        this.services = services;
        this.selectedModel = {
            modelId: SYS_DEFAULT_MODEL,
            providerId: "openrouter",
        }
    }

    static async create(): Promise<AppContext> {
        const providerSdk = await setProvider(
            "openrouter",
            appConfig.openRouterApiKey
        );
        const services = this.createServices();
        const user = await services.authService.getCurrentUser();
        if (user) {
            setProviderToLocal("openrouter", "OPENROUTER_API_KEY", user.id);
        }

        return new AppContext(providerSdk, services);
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
      registry.register(clearCommand);
      registry.register(exitCommand);
      registry.register(logoutCommand);
      registry.register(createHelpCommand(registry));
    
      return registry;
    }

    private static createServices() {
        return {
            authService: new AuthService(),
            databaseRegistryService: new DbRegistryService(),
            databaseService: new CloudSyncService(),
            ragService: new RagService(),
            llmService: new LlmService(),
            embeddingService: new EmbeddingService(),
            memoryService: new MemoryService(),
            contextManager: new ContextManager(),
            usageTracker: new UsageTrackerService(),
        };
    }
}

export const appContext = await AppContext.create();
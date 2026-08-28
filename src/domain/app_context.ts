import { appConfig } from "../infrastructure/index.ts";
import { setProvider, type ProviderId, type ProviderSDK } from "../infrastructure/provider/providers.ts";
import { DatabaseRegistryService } from "../services/database/database-registry.service.ts";
import { DatabaseService } from "../services/database/database.service.ts";
import { AuthService, ContextManager, EmbeddingService, LlmService, RagService, UsageTrackerService } from "../services/index.ts";
import { MemoryService } from "../services/memory/memory.service.ts";
import { clearCommand, connectCommand, createHelpCommand, exitCommand, loginCommand, logoutCommand } from "../ui/commands/index.ts";
import { SYS_DEFAULT_MODEL } from "../utils/constants.ts";
import { CommandRegistry, WorkSpace, type CommandContext } from "./index.ts";

interface AppServices {
    authService: AuthService;
    databaseRegistryService: DatabaseRegistryService;
    databaseService: DatabaseService;
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
    ) {
        this.providerSdk = providerSdk;
        this.commandRegistry = this.buildCommandRegistry();
        this.services = this.createServices();
        this.workspace = new WorkSpace();
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

        return new AppContext(providerSdk);
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

    createServices() {
        return {
            authService: new AuthService(),
            databaseRegistryService: new DatabaseRegistryService(),
            databaseService: new DatabaseService(),
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
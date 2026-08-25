import { DatabaseRegistryService } from "../services/database/database-registry.service.ts";
import { DatabaseService } from "../services/database/database.service.ts";
import { AuthService, EmbeddingService, LlmService, RagService } from "../services/index.ts";
import { clearCommand, connectCommand, createHelpCommand, exitCommand, loginCommand, logoutCommand } from "../ui/commands/index.ts";
import { CommandRegistry, WorkSpace, type CommandContext } from "./index.ts";

interface AppServices {
    authService: AuthService;
    databaseRegistryService: DatabaseRegistryService;
    databaseService: DatabaseService;
    ragService: RagService;
    llmService: LlmService;
    embeddingService: EmbeddingService;
}

interface AIProvider {
    name: string;
    apiKey: string;
}

class AppContext {
    providers: AIProvider[];
    commandRegistry: CommandRegistry;
    workspace: WorkSpace;
    services: AppServices;
    commandCtx?: CommandContext; 

    constructor() {
        this.commandRegistry = this.buildCommandRegistry();
        this.services = this.createServices();
        this.workspace = new WorkSpace();
        this.providers = [];
    }

    createCommandContext(commandCtx: CommandContext) {
        this.commandCtx = commandCtx;
    }

    addProvider(provider: AIProvider) {
        this.providers.push(provider);
    }

    removeProvider(providerName: string) {
        this.providers = this.providers.filter(provider => provider.name !== providerName);
    }

    getProvider(providerName: string) {
        return this.providers.find(provider => provider.name === providerName);
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
        };
    }
}

export const appContext = new AppContext();
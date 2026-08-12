import {
    askCommand,
    AuthService,
    clearCommand,
    CommandRegistry,
    connectCommand,
    createHelpCommand,
    EmbeddingService,
    exitCommand,
    LlmService,
    loginCommand,
    RagService,
    scanCommand,
    WorkSpace,
    type CommandContext
} from "@src/exports.ts";
import { DatabaseService } from "@src/services/database/database_service.ts";

interface AppServices {
    authService: AuthService;
    databaseService: DatabaseService
    ragService: RagService;
    llmService: LlmService;
    embeddingService: EmbeddingService;
}

export class AppContext {
    commandRegistry: CommandRegistry;
    workspace: WorkSpace;
    services: AppServices;
    commandCtx?: CommandContext; 

    constructor() {
        this.commandRegistry = this.buildCommandRegistry();
        this.services = this.createServices();
        this.workspace = new WorkSpace();
    }

    createCommandContext(commandCtx: CommandContext) {
        this.commandCtx = commandCtx;
    }

    buildCommandRegistry() {
      const registry = new CommandRegistry();
    
      registry.register(loginCommand);
      registry.register(connectCommand);
      registry.register(scanCommand);
      registry.register(askCommand);
      registry.register(clearCommand);
      registry.register(exitCommand);
      registry.register(createHelpCommand(registry));
    
      return registry;
    }

    createServices() {
        return {
            authService: new AuthService(),
            databaseService: new DatabaseService(),
            ragService: new RagService(),
            llmService: new LlmService(),
            embeddingService: new EmbeddingService(),
        };
    }
}

export const appContext = new AppContext();
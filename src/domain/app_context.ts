import type { AuthService, CommandContext, EmbeddingService, LlmService, RagService } from "@src/exports.ts";
import type { DatabaseService } from "@src/services/database/database_service.ts";

export interface AppContext {
    ui: CommandContext,
    service: {
        authService: AuthService;
        databaseService: DatabaseService
        ragService: RagService;
        llmService: LlmService;
        embeddingService: EmbeddingService;
    }
}
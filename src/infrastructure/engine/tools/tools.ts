import { dbOverviewTool, getAvailableDatabaseTool, isStaleTool, reIndexCompleteDatabase } from "./database_tools.ts";
import { semanticSearchTool } from "./search_tool.ts";

export const tools: Record<string, any> = {
    isStaleTool: isStaleTool,
    dbOverviewTool: dbOverviewTool,
    getAvailableDatabaseTool: getAvailableDatabaseTool,
    semanticSearchTool: semanticSearchTool,
    reIndexCompleteDatabase: reIndexCompleteDatabase
};

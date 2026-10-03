import {
    dbOverviewTool,
    getAvailableDatabaseTool,
    getEnumsTool,
    getFunctionsTool,
    getSchemasTool,
    getSequencesTool,
    getTablesTool,
    getTriggersTool,
    getViewsTool,
    reIndexCompleteDatabase
} from "./database_tools.ts";
import { executeQueryTool } from "./query_tool.ts";
import { semanticSearchTool } from "./search_tool.ts";

export const tools: Record<string, any> = {
    dbOverviewTool: dbOverviewTool,
    getAvailableDatabaseTool: getAvailableDatabaseTool,
    semanticSearchTool: semanticSearchTool,
    reIndexCompleteDatabase: reIndexCompleteDatabase,
    getSchemasTool: getSchemasTool,
    getTablesTool: getTablesTool,
    getViewsTool: getViewsTool,
    getTriggersTool: getTriggersTool,
    getFunctionsTool: getFunctionsTool,
    getEnumsTool: getEnumsTool,
    getSequencesTool: getSequencesTool,
    executeQueryTool: executeQueryTool,
};

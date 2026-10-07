import { tool } from "ai";
import z from "zod";
import { appContext } from "../../../domain/app_context.ts";
import { tblSessionState, type ISessionState } from "../../db/sqlite/tbl_session_state.ts";

export const updateSessionStateTool = tool({
    description: `Update what you already know this session. Call this after:
- Scanning a database schema
- Running a comparison between databases  
- Identifying key differences or migration issues
- Completing any significant analysis
Store summaries only, never raw schema data.`,
    inputSchema: z.object({
        indexed: z.array(z.string()).optional().describe("List of database IDs that have been indexed"),
        comparisons: z.array(
            z.object({
                between: z.array(z.string()).optional().describe("Databases being compared"),
                onlyInDb: z.record(z.string(), z.array(z.string())).optional().describe("Tables or important entities only in specific database by database ID"),
                structuralDiffs: z.record(z.string(), z.array(z.string())).optional().describe("Structural differences by database ID"),
            })
        ).optional().describe("Comparison results"),
    }),
    execute: ({indexed, comparisons}) => {
       const sessionId = appContext.currentChatSessionId;
       if (!sessionId) return { success: false };

       const existing = tblSessionState.getState(sessionId) ?? {
            indexed: [],
            comparisons: [],
       };
        
        const updatedComparision = comparisons?.map((c) => {
            return {
                between: c.between ?? [],
                onlyInDb: c.onlyInDb ?? {},
                structuralDiffs: c.structuralDiffs ?? {},
            }
         });

        const updated: ISessionState = {
            indexed: [...new Set([...existing.indexed, ...(indexed ?? [])])],
            comparisons: [...existing.comparisons, ...(updatedComparision ?? [])],
        };

        tblSessionState.upsertState(sessionId, updated);
        return { success: true };
    }   
});